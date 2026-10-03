import type { Template } from '../catalog';
import type { DemoPage, PreviewOptions } from '../options';

export type DesignProps = {
  template: Template;
  options: PreviewOptions;
  page: DemoPage;
  href: (page: DemoPage) => string;
};
