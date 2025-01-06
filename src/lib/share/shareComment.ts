import { getCommentUrl } from '../../helpers/const';
import { shareItem } from './shareItem';

export async function shareComment(params) {
  return shareItem({
    ...params,
    getUrl: getCommentUrl,
    formatMessage: (response) => {
      const attachment = response.attachment
        ? `| Attachment: [${response.attachment.file_name}](${response.attachment.file_url})`
        : '';
      return `${response.content} | Posted: ${new Date(response.posted_at).toLocaleString()} ${attachment}`;
    },
  });
}
