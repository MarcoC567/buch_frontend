const renderStars = (rating: string) => {
  const ratingValue = parseFloat(rating);
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 !== 0;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push("★");
    } else if (i === fullStars && hasHalfStar) {
      stars.push("☆");
    } else {
      stars.push("☆");
    }
  }

  return stars.join(" ");
};
export default renderStars;
