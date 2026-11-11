export interface LayerExtensionInstance {
  destroy(): void;
}

export interface LayerExtension<
  TOptions,
  TContext,
  TInstance extends LayerExtensionInstance = LayerExtensionInstance
> {
  readonly id: string;
  readonly priority?: number;
  supports(options: TOptions): boolean;
  attach(context: TContext): TInstance;
}
