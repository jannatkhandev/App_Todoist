import { getSectionUrl } from '../../helpers/const';
import { shareItem } from './shareItem';

export async function shareSection(params) {
  return shareItem({
    ...params,
    getUrl: getSectionUrl,
    formatMessage: (response) => {
      return `Section: ${response.name} | Project ID: ${response.project_id} | Order: ${response.order}`;
    },
  });
}
