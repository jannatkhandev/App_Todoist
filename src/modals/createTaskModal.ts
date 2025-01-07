import { IModify, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { ModalsEnum } from '../enums/Modals';
import {
  createToggleButton,
  getActionsBlock,
  getButton,
  getInputBox,
  getInputBoxDate,
  getOptions,
  getStaticSelectElement,
} from '../helpers/blockBuilder';

export async function createTaskModal({
  roomId,
  projectId,
  descriptionText,
}: {
  roomId: string;
  projectId?: string;
  descriptionText?: string;
}): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.CREATE_TASK + `#${roomId}`;
  const block: LayoutBlock[] = [];

  if (projectId) {
    let projectIdInputBox = await getInputBox(
      ModalsEnum.PROJECT_ID_INPUT_LABEL,
      ModalsEnum.PROJECT_ID_INPUT_LABEL_DEFAULT,
      ModalsEnum.PROJECT_ID_BLOCK,
      ModalsEnum.PROJECT_ID_INPUT,
      'plain_text_input',
      { initialValue: projectId }
    );
    block.push(projectIdInputBox);
  }

  let taskNameInputbox = await getInputBox(
    ModalsEnum.TASK_NAME_INPUT_LABEL,
    ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT,
    ModalsEnum.TASK_NAME_BLOCK,
    ModalsEnum.TASK_NAME_INPUT
  );

  let option1 = await getOptions('Urgent', '4');
  let option2 = await getOptions('High', '3');
  let option3 = await getOptions('Normal', '2');
  let option4 = await getOptions('Low', '1');

  let taskPrioritySelectElement = await getStaticSelectElement(
    ModalsEnum.TASK_PRIORITY_PLACEHOLDER,
    [option1, option2, option3, option4],
    ModalsEnum.TASK_PRIORITY_BLOCK,
    ModalsEnum.TASK_PRIORITY_ACTION_ID,
    'Normal'
  );
  let taskPriorityActionBlock = await getActionsBlock(ModalsEnum.TASK_PRIORITY_BLOCK, [
    taskPrioritySelectElement,
  ]);

  let taskDescriptionInputBox = await getInputBox(
    ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL,
    ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT,
    ModalsEnum.TASK_DESCRIPTION_BLOCK,
    ModalsEnum.TASK_DESCRIPTION_INPUT,
    undefined,
    { initialValue: descriptionText ?? '', multiline: true }
  );

  let taskDueDateInputBox = await getInputBoxDate(
    ModalsEnum.TASK_DUE_DATE_INPUT_LABEL,
    '',
    ModalsEnum.TASK_DUE_DATE_BLOCK,
    ModalsEnum.TASK_DUE_DATE_INPUT
  );

  // @TODO: Add this once we get Todoist User's ID <> RC User ID synced.
  // let taskAssigneeInputBlock = await getInputBox(ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL, ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_ASSIGNEES_BLOCK, ModalsEnum.TASK_ASSIGNEES_INPUT, 'users_select');

  // let assigneeRoomSelectElement = await createToggleButton(
  //   '',
  //   ModalsEnum.ASSIGNEE_NOTIFY_BLOCK,
  //   ModalsEnum.ASSIGNEE_NOTIFY_ACTION_ID,
  //   [
  //     { text: ModalsEnum.ASSIGNEE_NOTIFY_PLACEHOLDER, value: 'true' },
  //   ]
  // );

  block.push(
    taskNameInputbox,
    taskPriorityActionBlock,
    taskDescriptionInputBox,
    taskDueDateInputBox
  );

  const closeButton = await getButton('Cancel', '', '', 'secondary');
  const submitButton = await getButton(
    ModalsEnum.CREATE_TASK_MODAL_SUBMIT_BUTTOB_LABEL,
    '',
    '',
    '',
    'success'
  );

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.CREATE_TASK_MODAL_NAME,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
