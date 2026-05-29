import { HeadingBlock } from "./HeadingBlock";
import { TextBlock } from "./TextBlock";
import { ButtonBlock } from "./ButtonBlock";
import { InputBlock } from "./InputBlock";
import { ImageBlock } from "./ImageBlock";
import { RichTextBlock } from "./RichTextBlock";
import { ProductBlock } from "./ProductBlock";
import { BlogPostBlock } from "./BlogPostBlock";
import { SectionHeaderBlock } from "./SectionHeaderBlock";
import { HeroBlock } from "./StrideHeroBlock";
import { NumberLineBlock } from "./StrideNumberLineBlock";
import { CardBlock } from "./StrideCardBlock";
import { FeatureCardBlock } from "./StrideFeatureCardBlock";
import { AppPreviewBlock } from "./StrideAppShowcaseBlock";
import { SidebarItemBlock } from "./SidebarItemBlock";
import { NavItemBlock } from "./StrideNavItemBlock";
import { EventCardBlock } from "./StrideEventCardBlock";
import { NewsItemBlock } from "./StrideNewsItemBlock";

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
    "ct-section-header": SectionHeaderBlock,
    "ct-hero": HeroBlock,
    "ct-number-line": NumberLineBlock,
    "ct-card": CardBlock,
    "ct-feature-card": FeatureCardBlock,
    "ct-app-preview": AppPreviewBlock,
    "ct-sidebar-item": SidebarItemBlock,
    "ct-nav-item": NavItemBlock,
    "ct-event-card": EventCardBlock,
    "ct-news-item": NewsItemBlock,
};
