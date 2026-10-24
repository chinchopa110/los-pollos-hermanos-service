import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { StorageModule } from './storage/storage.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLError } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuditModule } from './audit/audit.module';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';

const MAX_COMPLEXITY = 100;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
      max: 100,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: process.env.NODE_ENV === 'production' ? true : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      csrfPrevention: false,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        {
          async requestDidStart() {
            return {
              async didResolveOperation({ request, document, schema }) {
                const complexity = getComplexity({
                  schema,
                  operationName: request.operationName,
                  query: document,
                  variables: request.variables,
                  estimators: [
                    fieldExtensionsEstimator(),
                    simpleEstimator({ defaultComplexity: 1 }),
                  ],
                });
                if (complexity > MAX_COMPLEXITY) {
                  throw new GraphQLError(
                    `Запрос слишком сложный: ${complexity}. Максимально допустимая сложность: ${MAX_COMPLEXITY}.`,
                    { extensions: { code: 'QUERY_TOO_COMPLEX', complexity, maxComplexity: MAX_COMPLEXITY } },
                  );
                }
              },
            };
          },
        },
      ],
    }),
    AuthModule,
    MenuModule,
    FeedbackModule,
    AuditModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ETagInterceptor,
    },
  ],
})
export class AppModule {}
