import notifee, { AndroidImportance } from '@notifee/react-native';

export const CHANNELS = {
  ADMIN: 'melaju-admin',
  USER: 'melaju-user',
};

export const initNotifChannels = async () => {
  await notifee.createChannel({
    id: CHANNELS.ADMIN,
    name: 'Notifikasi Admin',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  await notifee.createChannel({
    id: CHANNELS.USER,
    name: 'Notifikasi Pengguna',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
};

export const showNotif = async (channelId, title, body) => {
  try {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
    });
  } catch (e) {
    console.log('Notif error:', e);
  }
};
