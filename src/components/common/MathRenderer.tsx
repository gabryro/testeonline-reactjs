import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  block?: boolean;
}

export function MathRenderer({ text, block = false }: MathRendererProps) {
  try {
    if (block) return <BlockMath math={text} />;
    return <InlineMath math={text} />;
  } catch {
    return <span className="text-danger">[Invalid formula]</span>;
  }
}
