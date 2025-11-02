export const categoryEmojiMap = {
  
  food: '🍽️',
  transportation: '🚗',
  entertainment: '🎬',
  utilities: '🔌',
  shopping: '🛍️',
  health: '🏥',
  housing: '🏠',
  travel: '✈️',
  education: '🎓',
  other: '🧾',
  
  salary: '💼',
  freelance: '🧑‍💻',
  investment: '📈',
  gift: '🎁',
  refund: '🔁',
 
  uncategorized: '🗂️'
};

export function getCategoryEmoji(category) {
  if (!category) return categoryEmojiMap.uncategorized;
  const key = String(category).toLowerCase();
  return categoryEmojiMap[key] || categoryEmojiMap.uncategorized;
}
