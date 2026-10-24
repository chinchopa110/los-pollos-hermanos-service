import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type MenuSseEvent =
  | { type: 'created'; item: { id: string; name: string } }
  | { type: 'updated'; item: { id: string; name: string } }
  | { type: 'deleted'; item: { id: string; name: string } };

@Injectable()
export class MenuEventsService {
  private readonly stream$ = new Subject<{ data: string }>();

  emit(event: MenuSseEvent): void {
    this.stream$.next({ data: JSON.stringify(event) });
  }

  observe(): Observable<{ data: string }> {
    return this.stream$.asObservable();
  }
}
