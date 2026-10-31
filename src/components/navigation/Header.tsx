type Props = {
  onCommandOpen: () => void;
};

export default function Header({ onCommandOpen }: Props) {
  return (
    <header className="header">
      <button type="button" className="command-trigger" onClick={onCommandOpen}>
        MAX Command
      </button>
    </header>
  );
}
