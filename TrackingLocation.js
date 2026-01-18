import { useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { ref, update } from 'firebase/database';
import { database } from './FirebaseConfig';

const TrackingLocation = ({ peminjamanId }) => {

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        update(ref(database, `peminjaman/${peminjamanId}/lokasi`), {
          latitude,
          longitude,
          updatedAt: Date.now(),
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // update tiap 5 meter
        interval: 5000,
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  return null;
};

export default TrackingLocation;
