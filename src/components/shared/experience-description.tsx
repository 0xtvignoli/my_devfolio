/** Experience copy is prose with "- " bullet lines; render those as a real list. */
export function ExperienceDescription({ text }: { text: string }) {
  const blocks: Array<{ kind: 'p' | 'ul'; lines: string[] }> = [];
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const isBullet = line.startsWith('- ');
    const last = blocks.at(-1);
    const kind = isBullet ? 'ul' : 'p';
    if (last?.kind === kind) last.lines.push(isBullet ? line.slice(2) : line);
    else blocks.push({ kind, lines: [isBullet ? line.slice(2) : line] });
  }

  return (
    <>
      {blocks.map((block, index) =>
        block.kind === 'ul' ? (
          <ul key={index} className="my-3 list-disc space-y-1.5 pl-5">
            {block.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          block.lines.map((line, i) => (
            <p key={`${index}-${i}`} className="my-3 leading-relaxed">
              {line}
            </p>
          ))
        )
      )}
    </>
  );
}

