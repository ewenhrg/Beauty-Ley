export function ColorPriceTable() {
  const techniques = ["Ombré", "Balayage", "Highlight"] as const;
  const rows = [
    { length: "Cheveux court", prices: [4500, 5000, 7000] },
    { length: "Cheveux mi-longs", prices: [5500, 6000, 8500] },
    { length: "Cheveux longs", prices: [6000, 7000, 9500] },
  ];

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-[10px] tracking-[0.18em] text-ink-soft uppercase">À partir de</p>
      <table className="w-full min-w-[32rem] border-collapse text-left">
        <thead>
          <tr>
            <th className="bg-terracotta px-3 py-3 text-[11px] font-medium tracking-[0.16em] text-cream uppercase">
              Longueur
            </th>
            {techniques.map((technique) => (
              <th
                key={technique}
                className="bg-terracotta px-3 py-3 text-[11px] font-medium tracking-[0.16em] text-cream uppercase"
              >
                {technique}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.length} className="border-b border-line transition-colors hover:bg-blush/15">
              <th scope="row" className="py-3.5 pr-3 text-sm font-normal text-ink">
                {row.length}
              </th>
              {row.prices.map((price, index) => (
                <td key={`${row.length}-${techniques[index]}`} className="py-3.5">
                  <span className="price-chip inline-block px-2.5 py-1 text-[11px] font-medium text-cream">
                    {price} EGP
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
