import * as React from 'react';

import { cn } from '@/lib/utils';

import { PlusCircle, MinusCircle } from 'lucide-react';
import { Input } from './input';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  symbol?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ symbol, className, ...props }, ref) => {
    const [hitMax, setHitMax] = React.useState(false);
    const [hitMin, setHitMin] = React.useState(false);
    const incrementInput = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => incrementInput.current!, []);

    const increment = () => {
      incrementInput.current?.stepUp();
      // Supports onchange events
      incrementInput.current?.dispatchEvent(new Event('change', { bubbles: true }));
      // Disbale when hitting max
      setHitMax(incrementInput.current?.value === incrementInput.current?.max);
      setHitMin(incrementInput.current?.value === incrementInput.current?.min);
    };

    const decrement = () => {
      incrementInput.current?.stepDown();
      // Supports onchange events
      incrementInput.current?.dispatchEvent(new Event('change', { bubbles: true }));
      // Disbale when hitting min
      setHitMax(incrementInput.current?.value === incrementInput.current?.max);
      setHitMin(incrementInput.current?.value === incrementInput.current?.min);
    };

    return (
      <div className="flex items-center rounded-lg border p-1.5">
        <button
          type="button"
          disabled={hitMin}
          onClick={decrement}
          aria-label="decrease"
          className="text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusCircle className="h-4 w-4" />
        </button>

        <div className="relative px-2">
          <Input
            type="number"
            className={cn('no-steps w-fit border-0 bg-transparent p-0 pr-4 text-center', className)}
            ref={incrementInput}
            {...props}
          />
          {symbol && <span className="absolute right-4 top-0">{symbol}</span>}
        </div>

        <button
          type="button"
          disabled={hitMax}
          onClick={increment}
          aria-label="increase"
          className="text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>
    );
  },
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
