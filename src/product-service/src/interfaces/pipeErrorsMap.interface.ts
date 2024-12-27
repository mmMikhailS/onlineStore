export interface PipeErrorsMapInterface {
  property: string;
  constraints: {
    [type: string]: string;
  };
}
