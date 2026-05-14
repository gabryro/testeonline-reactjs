import { http } from '@/lib/http';
import type { Question } from '@/models';

export const questionBankService = {
  getQuestionBank: () =>
    http.post<Question[]>('/question-bank', {}).then((r) => r.data),

  deleteQuestion: (id: string) =>
    http.post('/delete-question-bank', { id }).then((r) => r.data),
};
