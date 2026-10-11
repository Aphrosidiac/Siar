/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module 'virtual:post-schema' {
  export interface JsonSchema {
    type?: string | string[];
    enum?: (string | number | null)[];
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    anyOf?: JsonSchema[];
    oneOf?: JsonSchema[];
    allOf?: JsonSchema[];
    nullable?: boolean;
    default?: unknown;
    maxLength?: number;
    minLength?: number;
    maximum?: number;
    minimum?: number;
    maxItems?: number;
    format?: string;
    const?: unknown;
  }
  const schema: { data: Record<string, JsonSchema>; firstComment: Record<string, number | null> };
  export default schema;
}
