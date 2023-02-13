import { MouseEvent } from 'react';

export default function InputBox({
  label,
  type,
  onChange,
  value,
}: {
  label: string;
  type: 'text' | 'number';
  onChange: (event: MouseEvent<HTMLFormElement>) => void;
  value: string | number;
}) {
  return (
    <>
    </>
  );
}
