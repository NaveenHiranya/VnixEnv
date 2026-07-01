type ArrayEditorProps = {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
};

export default function ArrayEditor({
  title,
  items,
  onChange,
}: ArrayEditorProps) {
  return (
    <div className="mb-8">
      <h2 className="font-bold text-xl mb-3">{title}</h2>

      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            className="border p-2 flex-1 rounded-2xl"
            value={item}
            onChange={(e) => {
              const copy = [...items];
              copy[index] = e.target.value;
              onChange(copy);
            }}
          />

          <button
            onClick={() =>
              onChange(items.filter((_, i) => i !== index))
            }
          >
            Delete
          </button>
        </div>
      ))}

      <button onClick={() => onChange([...items, ""])}>
        + Add
      </button>
    </div>
  );
}