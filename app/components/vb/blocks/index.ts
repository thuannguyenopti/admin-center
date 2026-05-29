import { HeadingBlock } from "./HeadingBlock";
import { TextBlock } from "./TextBlock";
import { ButtonBlock } from "./ButtonBlock";
import { InputBlock } from "./InputBlock";
import { ImageBlock } from "./ImageBlock";
import { RichTextBlock } from "./RichTextBlock";
import { ProductBlock } from "./ProductBlock";
import { BlogPostBlock } from "./BlogPostBlock";

export const BlockRegistry: Record<string, React.FC<any>> = {
    "ct-heading": HeadingBlock,
    "ct-text": TextBlock,
    "ct-rich-text": RichTextBlock,
    "ct-product": ProductBlock,
    "ct-button": ButtonBlock,
    "ct-input": InputBlock,
    "ct-image": ImageBlock,
    "ct-image-block": ImageBlock,
    "ct-blog-post": BlogPostBlock,
};
