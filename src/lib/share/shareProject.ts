import { getProjectUrl } from '../../helpers/const';
import { shareItem } from './shareItem';

export async function shareProject(params) {
  return shareItem({
    ...params,
    getUrl: getProjectUrl,
    formatMessage: (response) => {
      return `[${response.name}](${response.url}) | Comments: ${response.comment_count} | Color: ${response.color} | Favourite: ${response.is_favorite ? 'Yes' : 'No'}`;
    },
  });
}
