export function TeleportMenu({ options }: { options: string[] }) {
  return (
    <div>
      {options.map((option) => (
        <div key={option}>{option}</div>
      ))}
    </div>
  );
}
