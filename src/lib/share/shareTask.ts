import { getTaskUrl } from '../../helpers/const';
import { shareItem } from './shareItem';

export async function shareTask(params) {
  return shareItem({
    ...params,
    getUrl: getTaskUrl,
    formatMessage: (response) => {
      const dueInfo = response.due
        ? `Due: ${response.due.string || response.due.date}`
        : 'No due date';

      return `[${response.content}](${response.url}) | ${dueInfo} | Priority: ${response.priority} | Labels: ${response.labels.join(', ')} | Comments: ${response.comment_count}`;
    },
  });
}
