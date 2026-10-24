import { registerEnumType } from '@nestjs/graphql';

export enum MenuCategory {
  COMBO = 'combo',
  CHICKEN = 'chicken',
  SIDES = 'sides',
  DRINKS = 'drinks',
}

registerEnumType(MenuCategory, {
  name: 'MenuCategory',
  description: 'Категория позиции меню',
  valuesMap: {
    COMBO: { description: 'Комбо-наборы' },
    CHICKEN: { description: 'Курица и основное' },
    SIDES: { description: 'Гарниры' },
    DRINKS: { description: 'Напитки' },
  },
});
