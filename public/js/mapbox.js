export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoianNib29zdGVyMSIsImEiOiJjbGgwM3J5YW8wcHJrM2dwYzdqaGNidjRhIn0.0Cb9dYmPayz3-VzB2WQzgg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
  });
};
