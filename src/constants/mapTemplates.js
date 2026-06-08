// Safe HTML template generator

export const getCenterCountTemplate = (count) => {

  const safeCount = Number(count) || 0; // force number

  return `
    <div class="building-marker">
      <div class="building-icon">🏢</div>
      <div class="building-count">${safeCount}</div>
    </div>
  `;
};