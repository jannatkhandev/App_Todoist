import { getLabelUrl } from '../../helpers/const';
import { shareItem } from './shareItem';

export async function shareLabel(params) {
  return shareItem({
    ...params,
    getUrl: getLabelUrl,
    formatMessage: (response) => {
      return `Label: ${response.name} | Color: ${response.color} | Order: ${response.order} | Favorite: ${response.is_favorite ? 'Yes' : 'No'}`;
    },
  });
}
