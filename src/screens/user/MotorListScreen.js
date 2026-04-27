import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Modal, Alert, StatusBar,
  Animated, Dimensions, ImageBackground, TextInput, ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { auth, database } from '../../config/FirebaseConfig';
import C from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.72;
const CARD_IMG_H = Math.round(CARD_W * 0.6);   // 60% of card width — consistent ratio
const CARD_H = CARD_IMG_H + 130;                // image + body (name + plat + price + button)

const MotorListScreen = ({ navigation }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [dataMotor, setDataMotor] = useState([]);
  const [rentedPlats, setRentedPlats] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Re-fetch username setiap kali layar ini difokuskan (termasuk setelah edit profil)
  useFocusEffect(
    useCallback(() => {
      get(ref(database, 'users/' + auth.currentUser?.uid)).then(snap => {
        const nama = snap.val()?.nama || auth.currentUser?.email?.split('@')[0] || 'Pengguna';
        setUserName(nama.split(' ')[0]);
      });
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const db = getDatabase();
    const unsubMotor = onValue(ref(db, 'motor'), snap => {
      const val = snap.val();
      setDataMotor(val ? Object.keys(val).map(id => ({ id, ...val[id] })) : []);
    });
    const unsubPeminjaman = onValue(ref(db, 'peminjaman'), snap => {
      const val = snap.val();
      if (val) {
        const active = new Set(
          Object.values(val)
            .filter(p => p.status === 'dipinjam')
            .map(p => p.plat_motor)
        );
        setRentedPlats(active);
      } else {
        setRentedPlats(new Set());
      }
    });
    return () => { unsubMotor(); unsubPeminjaman(); };
  }, []);

  const handleDayPress = day => {
    // If no start, or both already set → set new start
    if (!startDate || endDate) {
      setStartDate(day.dateString);
      setEndDate('');
      setMarkedDates({
        [day.dateString]: { startingDay: true, endingDay: true, color: C.primary, textColor: C.dark },
      });
      return;
    }
    // Have start but no end
    if (day.dateString <= startDate) {
      // Tapped same or earlier — move start to new date
      setStartDate(day.dateString);
      setMarkedDates({
        [day.dateString]: { startingDay: true, endingDay: true, color: C.primary, textColor: C.dark },
      });
      return;
    }
    // Valid end date — build range (use local date methods to avoid UTC offset bug)
    const toLocalStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const dates = {};
    const cur = new Date(startDate + 'T00:00:00');
    const end = new Date(day.dateString + 'T00:00:00');
    while (cur <= end) {
      const dateStr = toLocalStr(cur);
      dates[dateStr] = {
        color: C.primary,
        textColor: C.dark,
        startingDay: dateStr === startDate,
        endingDay: dateStr === day.dateString,
      };
      cur.setDate(cur.getDate() + 1);
    }
    setEndDate(day.dateString);
    setMarkedDates(dates);
  };

  const resetModal = () => {
    setShowModal(false); setStartDate(''); setEndDate(''); setMarkedDates({});
  };

  const name = userName;
  const filteredMotor = searchQuery.trim()
    ? dataMotor.filter(m =>
        m.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.plat?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dataMotor;

  // Motor yang tersedia (belum disewa)
  const availableMotors = filteredMotor.filter(m => !rentedPlats.has(m.plat));

  const ListHeader = (
    <>
      {/* ───── HEADER ───── */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground
          source={require('../../assets/hero-bg.jpg')}
          style={s.header}
          imageStyle={s.headerImg}
          resizeMode="cover"
        >
          <View style={s.headerOverlay} />
          <View style={s.headerContent}>
            <View style={s.topBar}>
              <View style={s.logoRow}>
                <View style={s.logoDot} />
                <Text style={s.logoText}>MELAJU RENT</Text>
              </View>
            </View>
            <Text style={s.hi}>Halo, {name}</Text>
            <Text style={s.hiSub}>Temukan motor impianmu hari ini</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Cari motor..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </ImageBackground>
      </Animated.View>

      {/* ───── SECTION HEADER ───── */}
      <View style={s.secRow}>
        <View>
          <Text style={s.secTitle}>Motor Tersedia</Text>
          <Text style={s.secSub}>Pilih & langsung booking</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{availableMotors.length} unit</Text>
        </View>
      </View>

      {/* ───── HORIZONTAL CARD LIST ───── */}
      <View style={{ height: CARD_H }}>
        <FlatList
          data={availableMotors}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          snapToInterval={CARD_W + 16}
          decelerationRate="fast"
          ListEmptyComponent={
            <Text style={s.empty}>Tidak ada motor tersedia saat ini.</Text>
          }
          renderItem={({ item, index }) => (
            <MotorCard
              item={item}
              index={index}
              onPress={() => { setSelectedMotor(item); setShowModal(true); }}
            />
          )}
        />
      </View>

      {/* ───── SEMUA MOTOR TITLE ───── */}
      {filteredMotor.length > 0 && (
        <Text style={s.allTitle}>Semua Motor</Text>
      )}
    </>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ───── MAIN SCROLL ───── */}
      <FlatList
        data={filteredMotor}
        keyExtractor={i => i.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isRented = rentedPlats.has(item.plat);
          return (
            <TouchableOpacity
              style={[s.rowCard, isRented && s.rowCardRented]}
              onPress={() => {
                if (isRented) return;
                setSelectedMotor(item);
                setShowModal(true);
              }}
              activeOpacity={isRented ? 1 : 0.85}
            >
              <View style={s.rowImgWrap}>
                <Image
                  source={{ uri: item.foto || 'https://i.imgur.com/7yUvePI.jpg' }}
                  style={[s.rowImg, isRented && { opacity: 0.5 }]}
                />
                {isRented && (
                  <View style={s.rentedImgBadge}>
                    <Text style={s.rentedImgBadgeTxt}>●</Text>
                  </View>
                )}
              </View>
              <View style={s.rowInfo}>
                <Text style={[s.rowName, isRented && { color: C.textSecondary }]}>{item.nama}</Text>
                <Text style={s.rowPlat}>{item.plat}</Text>
                {isRented ? (
                  <View style={s.rentedBadge}>
                    <Text style={s.rentedBadgeTxt}>Sedang Disewa</Text>
                  </View>
                ) : (
                  <Text style={s.rowPrice}>
                    Rp {Number(item.harga).toLocaleString('id-ID')}
                    <Text style={s.rowPriceUnit}> /hari</Text>
                  </Text>
                )}
              </View>
              {!isRented && (
                <View style={s.rowArrow}>
                  <Text style={s.rowArrowText}>›</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* ───── CALENDAR MODAL ───── */}
      <Modal visible={showModal} transparent animationType="slide" statusBarTranslucent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />

            {/* scrollable area: motor card + calendar */}
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* motor summary */}
              <View style={s.sheetMotor}>
                <Image
                  source={{ uri: selectedMotor?.foto || 'https://i.imgur.com/7yUvePI.jpg' }}
                  style={s.sheetImg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.sheetName}>{selectedMotor?.nama}</Text>
                  <Text style={s.sheetPlat}>{selectedMotor?.plat}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.sheetPrice}>
                    Rp {Number(selectedMotor?.harga).toLocaleString('id-ID')}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textSecondary, marginTop: 1 }}>/hari</Text>
                </View>
              </View>

              <Text style={s.calLabel}>Pilih Tanggal Sewa</Text>

              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  todayTextColor: C.primary,
                  arrowColor: C.dark,
                  textDayFontWeight: '600',
                  textMonthFontWeight: '800',
                  calendarBackground: 'transparent',
                }}
              />

              <View style={s.dateRow}>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>MULAI</Text>
                  <Text style={s.dateVal}>{startDate || '—'}</Text>
                </View>
                <Text style={s.dateArrow}>→</Text>
                <View style={[s.dateBox, { alignItems: 'flex-end' }]}>
                  <Text style={s.dateLabel}>SELESAI</Text>
                  <Text style={s.dateVal}>{endDate || '—'}</Text>
                </View>
              </View>
            </ScrollView>

            {/* buttons always pinned at bottom */}
            <View style={s.btnRow}>
              <TouchableOpacity style={s.btnCancel} onPress={resetModal}>
                <Text style={s.btnCancelTxt}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.btnConfirm}
                onPress={() => {
                  if (!startDate || !endDate) { Alert.alert('Pilih tanggal dulu!'); return; }
                  navigation.navigate('Pesan Disini', {
                    nama_motor: selectedMotor.nama,
                    plat_motor: selectedMotor.plat,
                    harga_motor: selectedMotor.harga,
                    startDate, endDate,
                  });
                  resetModal();
                }}
              >
                <Text style={s.btnConfirmTxt}>Konfirmasi →</Text>
              </TouchableOpacity>
            </View>
            {/* tail: mengisi gap home indicator agar sheet mentok ke bawah */}
            <View style={{ height: Math.max(bottomInset, 8) }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ─── MOTOR CARD (horizontal) ───────────────────────── */
const MotorCard = ({ item, index, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
    }}>
      <TouchableOpacity style={[s.card, { width: CARD_W }]} activeOpacity={0.9} onPress={onPress}>
        {/* IMAGE — light card so image shows clearly */}
        <View style={s.cardImgWrap}>
          <Image
            source={{ uri: item.foto || 'https://i.imgur.com/7yUvePI.jpg' }}
            style={s.cardImg}
            resizeMode="cover"
          />
        </View>

        {/* INFO */}
        <View style={s.cardBody}>
          <View style={s.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{item.nama}</Text>
              <Text style={s.cardPlat}>{item.plat}</Text>
            </View>
            <View style={s.pricePill}>
              <Text style={s.priceNum}>
                Rp {Number(item.harga).toLocaleString('id-ID')}
              </Text>
              <Text style={s.priceUnit}>/hari</Text>
            </View>
          </View>

          <TouchableOpacity style={s.sewaBtn} onPress={onPress}>
            <Text style={s.sewaTxt}>Sewa Sekarang →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MotorListScreen;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F0F0' },

  /* HEADER */
  header: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerImg: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  logoText: { fontSize: 11, fontWeight: '900', color: C.primary, letterSpacing: 3.5 },
  hi: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', lineHeight: 38 },
  hiSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6, marginBottom: 20 },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  searchPlaceholder: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '500' },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  /* CONTENT */
  content: { flex: 1 },
  secRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 14,
  },
  secTitle: { fontSize: 18, fontWeight: '900', color: C.dark },
  secSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  countBadge: {
    backgroundColor: C.dark,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: { color: C.primary, fontSize: 12, fontWeight: '700' },

  /* HORIZONTAL LIST */
  hList: { paddingLeft: 24, paddingRight: 8, paddingBottom: 4 },
  empty: { textAlign: 'center', paddingTop: 40, color: C.textSecondary, paddingHorizontal: 20 },

  /* MOTOR CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  cardImgWrap: {
    width: '100%',
    height: CARD_IMG_H,
    backgroundColor: '#F7F7F7',
  },
  cardImg: { width: '100%', height: '100%' },
  cardBody: { padding: 16 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardName: { fontSize: 16, fontWeight: '800', color: C.dark },
  cardPlat: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  pricePill: { alignItems: 'flex-end', marginLeft: 8 },
  priceNum: { fontSize: 15, fontWeight: '900', color: C.primary },
  priceUnit: { fontSize: 10, color: C.textSecondary },
  sewaBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sewaTxt: { color: C.dark, fontWeight: '900', fontSize: 14 },

  /* ROW CARD (vertical all list) */
  allTitle: {
    fontSize: 16, fontWeight: '800', color: C.dark,
    marginBottom: 12, marginTop: 8,
    paddingHorizontal: 24,
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  rowImgWrap: { position: 'relative' },
  rowImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F0F0F0' },
  rentedImgBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  rentedImgBadgeTxt: { display: 'none' },
  rowInfo: { flex: 1, paddingHorizontal: 12 },
  rowName: { fontSize: 14, fontWeight: '800', color: C.dark },
  rowPlat: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  rowPrice: { fontSize: 14, fontWeight: '800', color: C.primary, marginTop: 4 },
  rowPriceUnit: { fontSize: 11, fontWeight: '400', color: C.textSecondary },
  rowCardRented: { opacity: 0.75 },
  rentedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
    marginTop: 4,
  },
  rentedBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  rowArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  rowArrowText: { fontSize: 20, color: C.dark, lineHeight: 26, marginLeft: 2 },

  /* MODAL */
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingBottom: 0,
    maxHeight: '92%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetMotor: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1, borderColor: '#F0F0F0',
    borderRadius: 16, padding: 12, marginBottom: 16, gap: 12,
  },
  sheetImg: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#F0F0F0' },
  sheetName: { fontSize: 15, fontWeight: '800', color: C.dark },
  sheetPlat: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  sheetPrice: { fontSize: 15, fontWeight: '900', color: C.primary },
  calLabel: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 4 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F7F7', borderRadius: 14, padding: 14, marginTop: 10,
  },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 9, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 4 },
  dateVal: { fontSize: 14, fontWeight: '700', color: C.dark },
  dateArrow: { fontSize: 20, color: C.primary, fontWeight: '900', paddingHorizontal: 8 },
  btnRow: { flexDirection: 'row', marginTop: 16, gap: 10, marginBottom: 12 },
  btnCancel: {
    flex: 1, padding: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center',
  },
  btnCancelTxt: { fontWeight: '700', color: '#6B7280', fontSize: 14 },
  btnConfirm: {
    flex: 2, padding: 15, borderRadius: 14,
    backgroundColor: C.primary, alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnConfirmTxt: { fontWeight: '900', color: C.dark, fontSize: 15 },
});
