export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoianNib29zdGVyMSIsImEiOiJjbGgwM3J5YW8wcHJrM2dwYzdqaGNidjRhIn0.0Cb9dYmPayz3-VzB2WQzgg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jsbooster1/clhcsdjtj00y201qt2kd28jfm',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();
  location.forEach((element) => {
    // create marker
    const htmlEl = document.createElement('div');
    htmlEl.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: htmlEl,
      anchor: 'bottom',
    })
      .setLngLat(element.coordinates)
      .addTo(map);

    // add poppup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(element.coordinates)
      .setHTML(`<p>Day ${element.day}: ${element.description}<p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(element.coordinates);
  });
  map.fitBounds(bounds, {
    top: 200,
    bottom: 100,
    left: 100,
    right: 100,
  });
};
