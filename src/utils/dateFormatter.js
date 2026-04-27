const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}`;
};

export const fmtDateRange = (start, end) => `${fmtDate(start)} – ${fmtDate(end)}`;
