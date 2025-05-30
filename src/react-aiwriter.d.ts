declare module 'react-aiwriter' {
  import * as React from 'react';

  export interface AIWriterProps {
    delay?: number;
    children: string;
  }

  const AIWriter: React.FC<AIWriterProps>;

  export default AIWriter;
}
