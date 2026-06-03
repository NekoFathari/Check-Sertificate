#!/usr/bin/env python3
"""
Analisis data Sertifikat - Classification Engine
Mengklasifikasi data Asal Instansi, KAB/KOTA, PROVINSI
Jalankan: cd scripts && python analisis.py
"""

import os
import sys
import re
from pathlib import Path

# Load .env
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')
except ImportError:
    pass

try:
    from pymongo import MongoClient
except ImportError:
    print("ERROR: pymongo belum terinstall. Jalankan: pip install pymongo python-dotenv")
    sys.exit(1)

# ============ DATA DICTIONARIES ============

PROVINCE_ABBREVIATIONS = {
    'jatim': 'Jawa Timur', 'jawa timur': 'Jawa Timur',
    'jabar': 'Jawa Barat', 'jawa barat': 'Jawa Barat',
    'jateng': 'Jawa Tengah', 'jawa tengah': 'Jawa Tengah',
    'dki': 'DKI Jakarta', 'dki jakarta': 'DKI Jakarta', 'jakarta': 'DKI Jakarta',
    'banten': 'Banten',
    'bali': 'Bali',
    'di yogyakarta': 'DI Yogyakarta', 'diy': 'DI Yogyakarta', 'yogyakarta': 'DI Yogyakarta',
    'aceh': 'Aceh', 'nanggroe aceh darussalam': 'Aceh',
    'sumut': 'Sumatera Utara', 'sumatera utara': 'Sumatera Utara',
    'sumsel': 'Sumatera Selatan', 'sumatera selatan': 'Sumatera Selatan',
    'sumbar': 'Sumatera Barat', 'sumatera barat': 'Sumatera Barat',
    'riau': 'Riau',
    'kepri': 'Kepulauan Riau', 'kepulauan riau': 'Kepulauan Riau',
    'jambi': 'Jambi',
    'bengkulu': 'Bengkulu',
    'lampung': 'Lampung',
    'bangka belitung': 'Bangka Belitung', 'babel': 'Bangka Belitung',
    'kalbar': 'Kalimantan Barat', 'kalimantan barat': 'Kalimantan Barat',
    'kalsel': 'Kalimantan Selatan', 'kalimantan selatan': 'Kalimantan Selatan',
    'kalteng': 'Kalimantan Tengah', 'kalimantan tengah': 'Kalimantan Tengah',
    'kaltim': 'Kalimantan Timur', 'kalimantan timur': 'Kalimantan Timur',
    'kaltara': 'Kalimantan Utara', 'kalimantan utara': 'Kalimantan Utara',
    'sulut': 'Sulawesi Utara', 'sulawesi utara': 'Sulawesi Utara',
    'sulteng': 'Sulawesi Tengah', 'sulawesi tengah': 'Sulawesi Tengah',
    'sulsel': 'Sulawesi Selatan', 'sulawesi selatan': 'Sulawesi Selatan',
    'sultra': 'Sulawesi Tenggara', 'sulawesi tenggara': 'Sulawesi Tenggara',
    'sulbar': 'Sulawesi Barat', 'sulawesi barat': 'Sulawesi Barat',
    'gorontalo': 'Gorontalo',
    'maluku': 'Maluku',
    'maluku utara': 'Maluku Utara',
    'ntb': 'Nusa Tenggara Barat', 'nusa tenggara barat': 'Nusa Tenggara Barat',
    'ntt': 'Nusa Tenggara Timur', 'nusa tenggara timur': 'Nusa Tenggara Timur',
    'papua': 'Papua',
    'papua barat': 'Papua Barat',
    'papua barat daya': 'Papua Barat Daya',
    'papua tengah': 'Papua Tengah',
    'papua pegunungan': 'Papua Pegunungan',
    'papua selatan': 'Papua Selatan',
    'kalimantan': 'Kalimantan',
    'jawa': 'Jawa',
    'sulawesi': 'Sulawesi',
    'sumatera': 'Sumatera',
}

POSITION_KEYWORDS = [
    'pengawas', 'kepala', 'guru', 'dosen', 'sekretaris', 'ketua',
    'wakil', 'madya', 'muda', 'pertama', 'moderator', 'narasumber',
    'keynote', 'keynote speaker', 'pemateri', 'anggota', 'fasilitator',
    'instruktur', 'pelatih', 'pembina', 'koordinator', 'panitia',
    'pembicara', 'pembimbing', 'pendamping', 'pengajar', 'tutor',
    'direktur', 'manajer', 'staf', 'operator', 'teknisi',
    'kepala sekolah', 'kepala dinas', 'kepala bidang',
]

SCORE_KEYWORDS = [
    'sangat baik', 'baik', 'cukup', 'kurang', 'abdac',
    'memuaskan', 'terpuji', 'amat baik', 'ab', 'b', 'c',
    'd', 'e', 'a', 'sangat memuaskan',
]

INSTITUTION_PREFIXES = [
    'sd ', 'sdn ', 'smp ', 'smpn ', 'sma ', 'sman ', 'smk ', 'smkn ',
    'mi ', 'min ', 'mts ', 'mtsn ', 'ma ', 'man ',
    'tk ', 'ra ', 'paud ', 'upt ', 'uptd ',
    'universitas ', 'universiti ', 'institut ',
    'sekolah tinggi ', 'akademi ', 'politeknik ',
    'sd negeri ', 'sdn ', 'sdit ', 'sd inpres ',
    'smp negeri ', 'sma negeri ', 'smk negeri ',
    'sltp ', 'slta ', 'slb ',
    'sds ', 'sdns ', 'smps ', 'smas ',
]

CITY_NAMES = [
    'surabaya', 'malang', 'kediri', 'tuban', 'bangkalan', 'pamekasan',
    'sumenep', 'sampang', 'gresik', 'sidoarjo', 'mojokerto',
    'jombang', 'ngawi', 'madiun', 'magetan', 'ponorogo',
    'trenggalek', 'tulungagung', 'blitar', 'pasuruan', 'probolinggo',
    'bondowoso', 'situbondo', 'banyuwangi', 'bojonegoro', 'lamongan',
    'nganjuk', 'pacitan', 'lumajang', 'batu',
    'jakarta', 'bandung', 'bogor', 'depok', 'bekasi', 'tangerang',
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'magelang',
    'salatiga', 'pekalongan', 'tegal', 'cilacap', 'purwokerto',
    'banyumas', 'kebumen', 'purworejo', 'wonosobo', 'temanggung',
    'kendal', 'demak', 'kudus', 'jepara', 'pati', 'rembang', 'blora',
    'grobogan', 'sragen', 'karanganyar', 'wonogiri', 'boyolali',
    'klaten', 'sukoharjo', 'wijayakusuma',
    'denpasar', 'mataram', 'kupang', 'waingapu', 'ende', 'maumere',
    'medan', 'palembang', 'padang', 'pekanbaru', 'batam',
    'tanjung pinang', 'pangkal pinang', 'bandar lampung',
    'jambi', 'bengkulu', 'palangka raya', 'banjarmasin',
    'samarinda', 'balikpapan', 'tarakan', 'pontianak',
    'manado', 'palu', 'makassar', 'kendari', 'mamuju',
    'gorontalo', 'ambon', 'ternate', 'jayapura', 'merauke',
    'manokwari', 'sorong', 'timika', 'nabire',
    'serang', 'cilegon', 'pandeglang', 'lebak',
    'karawang', 'cirebon', 'indramayu', 'subang', 'purwakarta',
    'sumedang', 'majalengka', 'kuningan', 'ciamis', 'tasikmalaya',
    'garut', 'cianjur', 'sukabumi', 'banjar',
    'brebes', 'pemalang', 'banyumas', 'purbalingga', 'banjarnegara',
    'batang', 'kajen', 'slawi', 'purbalingga',
]

def normalize(text):
    if not text:
        return ''
    return str(text).strip().lower()

KNOWN_ABBREVIATIONS_UPPER = {
    'sd', 'sdn', 'smp', 'smpn', 'sma', 'sman', 'smk', 'smkn',
    'mi', 'min', 'mts', 'mtsn', 'ma', 'man', 'tk', 'ra', 'paud',
    'sltp', 'slta', 'slb', 'upt', 'uptd', 'sdit', 'sdn',
    'igi', 'ai', 'pmm', 'it', 'ict', 'sdmi', 'kdrt', 'k3',
    'mts', 'mbkm', 'rpp', 'silabus', 'kurikulum', 'sbmptn',
    'snbt', 'snbp', 'usbn', 'ptk', 'tendik',
}

ROMAN_NUMERALS = {
    'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'v': 'V',
    'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX', 'x': 'X',
    'xi': 'XI', 'xii': 'XII',
}

def smart_title(text):
    if not text:
        return text
    original = str(text).strip()
    words = re.split(r'(\s+|/)', original)
    result_parts = []
    for w in words:
        if not w or w.isspace():
            result_parts.append(w)
            continue
        if w == '/':
            result_parts.append('/')
            continue
        if re.match(r'^\d+$', w):
            result_parts.append(w)
            continue
        lower = w.lower().strip('/')
        if lower in ROMAN_NUMERALS:
            result_parts.append(w.replace(lower, ROMAN_NUMERALS[lower]))
            continue
        if lower in KNOWN_ABBREVIATIONS_UPPER:
            result_parts.append(w.upper())
            continue
        if len(w) <= 3 and w.isalpha() and w.isupper():
            result_parts.append(w)
            continue
        if w.lower().startswith('kab.') or w.lower().startswith('kota'):
            prefix = w[:4] if w.lower().startswith('kab.') else w[:5]
            rest = w[len(prefix):]
            result_parts.append(prefix.title() + rest.title())
            continue
        result_parts.append(w.title())
    return ''.join(result_parts)

def expand_province_abbreviation(text):
    text = normalize(text)
    if not text:
        return text
    if text in PROVINCE_ABBREVIATIONS:
        return PROVINCE_ABBREVIATIONS[text]
    cleaned = text.replace('.', '').replace('prop.', '').replace('prov.', '').replace('propinsi', '').replace('provinsi', '').strip()
    if cleaned in PROVINCE_ABBREVIATIONS:
        return PROVINCE_ABBREVIATIONS[cleaned]
    for abbr, full in PROVINCE_ABBREVIATIONS.items():
        if cleaned in abbr or abbr in cleaned:
            return full
    return text.upper() if text else text

def is_score(value):
    val = normalize(value)
    if not val:
        return False
    for kw in SCORE_KEYWORDS:
        if kw in val:
            return True
    if re.match(r'^[a-eA-E]$', val):
        return True
    return False

def is_position(value):
    val = normalize(value)
    if not val:
        return False
    for kw in POSITION_KEYWORDS:
        if kw in val:
            return True
    if re.match(r'^(kepala|sekretaris|ketua|wakil|anggota)\s', val):
        return True
    return False

def is_institution(value):
    val = normalize(value)
    if not val:
        return False
    for prefix in INSTITUTION_PREFIXES:
        if val.startswith(prefix):
            return True
    if re.match(r'^(sd|smp|sma|smk|mi|mts|ma|tk|ra)\s', val):
        return True
    return False

def is_province(value):
    val = normalize(value)
    if not val:
        return False
    if val in PROVINCE_ABBREVIATIONS:
        return True
    cleaned = val.replace('.', '').replace('prop.', '').replace('prov.', '').replace('propinsi', '').replace('provinsi', '').strip()
    if cleaned in PROVINCE_ABBREVIATIONS:
        return True
    for name in PROVINCE_ABBREVIATIONS.values():
        if normalize(name) in cleaned or cleaned in normalize(name):
            return True
    return False

def is_city(value):
    val = normalize(value)
    if not val:
        return False
    val = re.sub(r'^(kab\.?|kota)\s+', '', val)
    val = val.strip()
    for city in CITY_NAMES:
        if val == city or val in city or city in val:
            return True
    if re.match(r'^(kab\.?|kota)\s+', normalize(value)):
        return True
    return False

def classify(value):
    val = normalize(value)
    if not val:
        return 'kosong'
    if is_score(val):
        return 'nilai'
    if is_position(val):
        return 'jabatan'
    if is_institution(val):
        return 'institusi'
    if is_province(val):
        return 'provinsi'
    if is_city(val):
        return 'kota'
    if len(val) <= 25 and not re.search(r'[.,]', val) and re.search(r'[A-Za-z]', value):
        return 'kota'
    return 'lainnya'


def extract_city_from_institution(text):
    text = normalize(text)
    if not text:
        return None
    text = re.sub(r'^(sd|smp|sma|smk|mi|mts|ma|sdn|smpn|sman|smkn|min|mtsn|man)\s+negeri\s', '', text)
    text = re.sub(r'^(sd|smp|sma|smk|mi|mts|ma|tk|ra|paud|upt|uptd|slb)\s+', '', text)
    text = re.sub(r'^\d+[-/]?\s*', '', text)
    text = re.sub(r'^(swasta|negeri)\s+', '', text)
    for city in sorted(CITY_NAMES, key=len, reverse=True):
        if city in text:
            parts = text.replace(city, f'|{city}|').split('|')
            for p in parts:
                stripped = p.strip()
                if stripped in CITY_NAMES:
                    return stripped.upper()
            after = text[text.index(city) + len(city):].strip()
            if not after or re.match(r'^[iI]*[/\-]*\d*$', after) or after == 'kota':
                return city.upper()
    return None


def process_record(doc):
    asal_val = normalize(doc.get('asal', ''))
    kab_val = normalize(doc.get('kab_kot', ''))
    prov_val = normalize(doc.get('provinsi', ''))
    status_original = normalize(doc.get('status', ''))

    updates = {}
    result_asal = asal_val
    result_kab = kab_val
    result_prov = prov_val
    result_posisi = ''
    result_lainnya = ''
    result_asal_type = ''

    field_sources = {'asal': ('institusi', result_asal if result_asal else ''),
                     'posisi': ('jabatan', ''),
                     'lainnya': ('nilai', ''),
                     'kab_kot': ('kota', result_kab if result_kab else ''),
                     'provinsi': ('provinsi', result_prov if result_prov else '')}

    asal_cat = classify(asal_val) if asal_val else 'kosong'
    kab_cat = classify(kab_val) if kab_val else 'kosong'
    prov_cat = classify(prov_val) if prov_val else 'kosong'

    used_kab = bool(kab_val and kab_cat == 'kota')
    used_prov = bool(prov_val and prov_cat == 'provinsi')

    # 1) Route PROVINSI value
    if prov_val:
        if prov_cat == 'provinsi':
            result_prov = expand_province_abbreviation(prov_val)
            used_prov = True
        elif prov_cat == 'jabatan':
            result_posisi = prov_val
        elif prov_cat == 'kota':
            if not used_kab:
                result_kab = prov_val
                used_kab = True
            else:
                result_lainnya = prov_val
        elif prov_cat == 'institusi':
            result_asal = prov_val
        elif prov_cat == 'nilai':
            result_lainnya = prov_val
        elif prov_cat != 'kosong':
            result_lainnya = prov_val

    # 2) Route KAB/KOTA value
    if kab_val:
        if kab_cat == 'kota':
            result_kab = kab_val
            used_kab = True
        elif kab_cat == 'provinsi':
            if not used_prov:
                result_prov = expand_province_abbreviation(kab_val)
                used_prov = True
            else:
                result_lainnya = kab_val
        elif kab_cat == 'jabatan':
            result_posisi = kab_val
        elif kab_cat == 'institusi':
            if not result_asal or result_asal == asal_val:
                result_asal = kab_val
            else:
                result_lainnya = kab_val
        elif kab_cat == 'nilai':
            result_lainnya = kab_val
        elif kab_cat != 'kosong':
            result_lainnya = kab_val

    # 3) Route Asal Instansi value
    if asal_val:
        if asal_cat == 'institusi':
            result_asal = asal_val
        elif asal_cat == 'kota':
            if not used_kab:
                result_kab = asal_val
                used_kab = True
            elif not result_asal:
                result_asal = asal_val
            else:
                result_lainnya = asal_val
        elif asal_cat == 'provinsi':
            if not used_prov:
                result_prov = expand_province_abbreviation(asal_val)
                used_prov = True
            else:
                result_lainnya = asal_val
        elif asal_cat == 'jabatan':
            if not result_posisi:
                result_posisi = asal_val
            else:
                result_lainnya = asal_val
        elif asal_cat == 'nilai':
            result_lainnya = asal_val
        elif asal_cat != 'kosong':
            result_lainnya = asal_val

    # 4) Extract city from asal if kab_kot still empty
    if not result_kab and result_asal:
        extracted = extract_city_from_institution(result_asal)
        if extracted:
            result_kab = extracted

    # 5) Set asal_type based on what asal actually contains
    if result_asal:
        result_asal_type = classify(result_asal)
        if result_asal_type in ('provinsi', 'kota', 'jabatan', 'nilai', 'kosong', 'lainnya'):
            if result_asal_type == 'provinsi' and not used_prov:
                result_prov = expand_province_abbreviation(result_asal)
                used_prov = True
                result_asal = ''
                result_asal_type = ''
            elif result_asal_type == 'kota' and not used_kab:
                result_kab = result_asal
                result_asal = ''
                result_asal_type = ''
            elif result_asal_type in ('jabatan',):
                if not result_posisi:
                    result_posisi = result_asal
                result_asal = ''
                result_asal_type = ''
            elif result_asal_type in ('nilai',):
                result_lainnya = result_asal
                result_asal = ''
                result_asal_type = ''

    # 6) Expand abbreviations in province
    if result_prov:
        result_prov = expand_province_abbreviation(result_prov)

    # 7) Map original STATUS to kategori
    status_lower = normalize(doc.get('status', ''))
    kategori = None
    if status_lower in ('peserta', 'pemateri', 'narasumber', 'panitia'):
        kategori = status_lower.upper()
        if not status_original or status_original.lower() in ('aktif', 'tidak aktif'):
            updates['status'] = 'Aktif'

    # 8) Detect kategori from posisi keywords if not set yet
    if not kategori and result_posisi:
        pos_lower = normalize(result_posisi)
        if 'narasumber' in pos_lower or 'pemateri' in pos_lower or 'keynote' in pos_lower:
            kategori = 'NARASUMBER'
        elif 'panitia' in pos_lower:
            kategori = 'PANITIA'

    # Build updates
    updates['asal'] = smart_title(result_asal) if result_asal else asal_val
    updates['kab_kot'] = smart_title(result_kab) if result_kab else kab_val
    updates['provinsi'] = smart_title(result_prov) if result_prov else prov_val
    updates['posisi'] = smart_title(result_posisi) if result_posisi else None
    updates['lainnya'] = result_lainnya if result_lainnya else None
    updates['asal_type'] = result_asal_type if result_asal_type else None
    if kategori:
        updates['kategori'] = kategori

    return updates


def get_db():
    uri = os.environ.get('DATABASE_URL', '')
    if not uri:
        print('ERROR: DATABASE_URL tidak ditemukan di .env')
        sys.exit(1)
    client = MongoClient(uri, serverSelectionTimeoutMS=10000)
    uri_lower = uri.lower()
    if 'mongodb+srv' in uri_lower:
        db_name = uri.split('/')[-1].split('?')[0] if '/' in uri else 'igijatim'
    elif '/' in uri:
        db_name = uri.rsplit('/', 1)[-1].split('?')[0]
    else:
        db_name = 'igijatim'
    db = client.get_database(db_name)
    return client, db


def regenerate_analisis(db):
    print('  Menghapus data AnalisisPeserta lama...')
    db.AnalisisPeserta.delete_many({})

    pipeline = [
        {'$group': {
            '_id': {
                'nama_acara': '$nama_acara',
                'kategori': '$kategori',
                'asal_type': '$asal_type',
            },
            'count': {'$sum': 1},
        }},
        {'$sort': {'_id.nama_acara': 1, '_id.kategori': 1, '_id.asal_type': 1}},
    ]

    results = list(db.Sertifikat.aggregate(pipeline))
    count = 0
    for r in results:
        if not r.get('_id'):
            continue
        g = r['_id']
        db.AnalisisPeserta.insert_one({
            'nama_acara': g.get('nama_acara', '-'),
            'kategori': g.get('kategori', '-'),
            'asal_type': g.get('asal_type') or None,
            'count': r.get('count', 0),
            'createdAt': None,
            'updatedAt': None,
        })
        count += 1

    print(f'  AnalisisPeserta: {count} grup dibuat')


def main():
    print('Connecting to MongoDB...')
    client, db = get_db()

    try:
        collection = db.Sertifikat
        total = collection.count_documents({})
        print(f'Total records: {total}')

        updated = 0
        batch = []
        BATCH_SIZE = 500

        for doc in collection.find():
            updates = process_record(doc)
            if not updates:
                continue

            doc_id = doc['_id']
            filtered = {k: v for k, v in updates.items() if v is not None or k in ('posisi', 'lainnya', 'asal_type', 'kategori')}
            if not filtered:
                continue

            batch.append((doc_id, filtered))
            if len(batch) >= BATCH_SIZE:
                for oid, upd in batch:
                    collection.update_one({'_id': oid}, {'$set': upd})
                print(f'  Updated {updated + len(batch)}/{total}...')
                updated += len(batch)
                batch.clear()

        for oid, upd in batch:
            collection.update_one({'_id': oid}, {'$set': upd})
        updated += len(batch)

        print(f'Classification complete: {updated}/{total} records updated')

        regenerate_analisis(db)
        print('Done!')

    finally:
        client.close()


if __name__ == '__main__':
    main()
