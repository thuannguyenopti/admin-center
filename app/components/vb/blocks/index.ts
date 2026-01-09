import { HeadingBlock } from "./HeadingBlock";
import { TextBlock } from "./TextBlock";
import { ButtonBlock } from "./ButtonBlock";
import { InputBlock } from "./InputBlock";
import { ImageBlock } from "./ImageBlock";

export const BlockRegistry: Record<string, React.FC<any>> = {
    "ct-heading": HeadingBlock,
    "ct-text": TextBlock,
    "ct-button": ButtonBlock,
    "ct-input": InputBlock,
    "ct-image": ImageBlock,
    // Add aliases for legacy support during migration
    Heading: HeadingBlock,
    Text: TextBlock,
    Button: ButtonBlock,
    Input: InputBlock,
    Image: ImageBlock,
};
