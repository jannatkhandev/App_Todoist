import {
  ActionsBlock,
  ButtonElement,
  ContextBlock,
  DividerBlock,
  InputBlock,
  Option,
  PlainTextInputElement,
  SectionBlock,
  StaticSelectElement,
  ToggleSwitchElement,
  UsersSelectElement,
} from '@rocket.chat/ui-kit';

import { AppEnum } from '../enums/App';

export async function getInputBox(
  labelText: string,
  placeholderText: string,
  blockId: string,
  actionId: string,
  type:
    | 'channels_select'
    | 'conversations_select'
    | 'datepicker'
    | 'linear_scale'
    | 'multi_channels_select'
    | 'multi_conversations_select'
    | 'multi_static_select'
    | 'multi_users_select'
    | 'plain_text_input'
    | 'static_select'
    | 'users_select'
    | 'checkbox'
    | 'radio_button'
    | 'time_picker'
    | 'toggle_switch' = 'plain_text_input',
  options: {
    initialValue?: string;
    multiline?: boolean;
    initialDate?: string;
    options?: Array<{ text: string; value: string }>;
    minValue?: number;
    maxValue?: number;
  } = {}
): Promise<InputBlock> {
  const baseElement = {
    placeholder: {
      type: 'plain_text' as const,
      text: placeholderText,
    },
    appId: AppEnum.APP_ID,
    blockId,
    actionId,
  };

  let element: InputBlock['element'];

  switch (type) {
    case 'plain_text_input':
      element = {
        ...baseElement,
        type,
        initialValue: options?.initialValue,
        multiline: options?.multiline,
      } as PlainTextInputElement;
      break;

    case 'users_select':
      element = {
        ...baseElement,
        type,
      } as UsersSelectElement;
      break;

    default:
      element = {
        ...baseElement,
        type,
      } as InputBlock['element'];
  }

  return {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element,
  };
}

export async function getInputBoxDate(
  labelText: string,
  placeholderText: string,
  blockId: string,
  actionId: string,
  initialDate?: string
): Promise<InputBlock> {
  const block: InputBlock = {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element: {
      type: 'datepicker',
      placeholder: {
        type: 'plain_text',
        text: placeholderText,
      },
      appId: AppEnum.APP_ID,
      blockId: blockId,
      actionId: actionId,
      initialDate: initialDate,
    },
  };
  return block;
}

export async function getButton(
  labelText: string,
  blockId: string,
  actionId: string,
  value?: string,
  style?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success',
  url?: string
): Promise<ButtonElement> {
  const button: ButtonElement = {
    type: 'button',
    text: {
      type: 'plain_text',
      text: labelText,
    },
    appId: AppEnum.APP_ID,
    blockId: blockId,
    actionId: actionId,
    url: url,
    value: value,
    style: style,
  };
  return button;
}

export async function getSectionBlock(labelText: string, accessory?: any): Promise<SectionBlock> {
  const block: SectionBlock = {
    type: 'section',
    text: {
      type: 'plain_text',
      text: labelText,
    },
    accessory: accessory,
  };
  return block;
}

export async function getDividerBlock(): Promise<DividerBlock> {
  const block: DividerBlock = {
    type: 'divider',
  };
  return block;
}

export async function getContextBlock(elementText: string): Promise<ContextBlock> {
  const block: ContextBlock = {
    type: 'context',
    elements: [
      {
        type: 'plain_text',
        text: elementText,
      },
    ],
  };
  return block;
}

export async function getStaticSelectElement(
  placeholderText: string,
  options: Array<Option>,
  blockId: string,
  actionId: string,
  initialValue?: Option['value']
): Promise<StaticSelectElement> {
  const block: StaticSelectElement = {
    type: 'static_select',
    placeholder: {
      type: 'plain_text',
      text: placeholderText,
    },
    options: options,
    appId: AppEnum.APP_ID,
    blockId: blockId,
    actionId: actionId,
    initialValue: initialValue,
  };
  return block;
}

export async function getOptions(text: string, value: string): Promise<Option> {
  const block: Option = {
    text: { type: 'plain_text', text: text },
    value: value,
  };
  return block;
}

export async function getActionsBlock(
  blockId: string,
  elements: Array<ButtonElement> | Array<StaticSelectElement> | Array<ToggleSwitchElement>
): Promise<ActionsBlock> {
  const block: ActionsBlock = {
    type: 'actions',
    blockId: blockId,
    elements: elements,
  };
  return block;
}

export async function createToggleButton(
  labelText: string,
  blockId: string,
  actionId: string,
  options: Array<{ text: string; value: string }>
): Promise<InputBlock> {
  return {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element: {
      type: 'toggle_switch',
      options: options.map((opt) => ({
        text: { type: 'plain_text', text: opt.text },
        value: opt.value,
      })),
      initialOptions: [],
      appId: AppEnum.APP_ID,
      blockId,
      actionId,
    } as ToggleSwitchElement,
  };
}
