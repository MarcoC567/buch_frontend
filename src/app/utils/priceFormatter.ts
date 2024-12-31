 const formatPrice = (preis: number) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    });
    return formatter.format(preis);
  };
  export default formatPrice;