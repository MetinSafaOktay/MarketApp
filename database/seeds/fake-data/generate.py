#!/usr/bin/env python3
"""Erenler Market — showcase katalog seed'i üretir (database/seeds/fake-data/catalog.sql)."""
import uuid, json, textwrap

NS = uuid.UUID("11111111-2222-3333-4444-555555555555")
def uid(*parts): return str(uuid.uuid5(NS, ":".join(parts)))
def j(d): return "'" + json.dumps(d, ensure_ascii=False).replace("'", "''") + "'::jsonb"
def s(x): return "'" + str(x).replace("'", "''") + "'"
def img(slug): return f"https://picsum.photos/seed/erenler-{slug}/700/700"

# (slug, tr, en, de, order)
CATEGORIES = [
    ("meyve-sebze", "Meyve & Sebze", "Fruit & Vegetables", "Obst & Gemüse", 1),
    ("sut-kahvaltilik", "Süt & Kahvaltılık", "Dairy & Breakfast", "Milch & Frühstück", 2),
    ("et-sarkuteri", "Et & Şarküteri", "Meat & Deli", "Fleisch & Feinkost", 3),
    ("firin-unlu", "Fırın & Unlu Mamuller", "Bakery", "Backwaren", 4),
    ("icecek", "İçecekler", "Beverages", "Getränke", 5),
    ("atistirmalik", "Atıştırmalık", "Snacks", "Snacks", 6),
    ("temizlik", "Temizlik", "Cleaning", "Reinigung", 7),
]

# cat_slug, [(slug, tr, en, de, sku, price, original_price|None, new, stock, [img_slugs], desc_tr)]
PRODUCTS = {
    "meyve-sebze": [
        ("domates", "Domates (kg)", "Tomato (kg)", "Tomate (kg)", "MV-DOMATES", "34.90", "42.00", False, 120, ["domates"], "Taze, günlük toplanan salkım domates."),
        ("salatalik", "Salatalık (kg)", "Cucumber (kg)", "Gurke (kg)", "MV-SALATALIK", "27.50", None, False, 90, ["salatalik"], "Çıtır kokan sera salatalığı."),
        ("muz", "İthal Muz (kg)", "Banana (kg)", "Banane (kg)", "MV-MUZ", "44.90", None, True, 60, ["muz"], "Ekvador muzu, olgun ve tatlı."),
        ("elma", "Amasya Elması (kg)", "Amasya Apple (kg)", "Apfel (kg)", "MV-ELMA", "29.90", "36.90", False, 150, ["elma"], "Yerli Amasya elması."),
        ("patates", "Patates (kg)", "Potato (kg)", "Kartoffel (kg)", "MV-PATATES", "19.90", None, False, 200, ["patates"], "Nişastası yüksek, kızartmalık patates."),
    ],
    "sut-kahvaltilik": [
        ("sut-1l", "Günlük Süt 1 L", "Fresh Milk 1 L", "Frischmilch 1 L", "SK-SUT-1L", "32.00", None, False, 80, ["sut"], "Tam yağlı günlük pastörize süt."),
        ("yumurta-30", "Yumurta 30'lu", "Eggs (30 pack)", "Eier 30er", "SK-YUMURTA-30", "119.90", "139.90", False, 45, ["yumurta"], "Gezen tavuk yumurtası, L boy."),
        ("beyaz-peynir", "Beyaz Peynir 600 g", "White Cheese 600 g", "Weißkäse 600 g", "SK-PEYNIR-600", "144.50", None, False, 35, ["peynir"], "Tam yağlı inek sütü beyaz peyniri."),
        ("bal-450", "Süzme Çiçek Balı 450 g", "Flower Honey 450 g", "Blütenhonig 450 g", "SK-BAL-450", "189.00", None, True, 25, ["bal"], "Anadolu çiçek balı."),
        ("zeytin-siyah", "Siyah Zeytin 800 g", "Black Olives 800 g", "Schwarze Oliven 800 g", "SK-ZEYTIN-800", "159.90", "184.00", False, 40, ["zeytin"], "Gemlik tipi az tuzlu siyah zeytin."),
    ],
    "et-sarkuteri": [
        ("kiyma", "Dana Kıyma (kg)", "Ground Beef (kg)", "Rinderhack (kg)", "ES-KIYMA", "429.00", None, False, 20, ["kiyma"], "Günlük çekilmiş yağsız dana kıyma."),
        ("tavuk-but", "Tavuk But (kg)", "Chicken Thigh (kg)", "Hähnchenschenkel (kg)", "ES-TAVUK-BUT", "129.90", "149.90", False, 30, ["tavuk"], "Beyaz et tavuk but."),
        ("sucuk", "Fermente Sucuk 350 g", "Sujuk Sausage 350 g", "Sucuk 350 g", "ES-SUCUK-350", "164.90", None, False, 28, ["sucuk"], "Dana etinden fermente sucuk."),
        ("salam", "Dana Salam 200 g", "Beef Salami 200 g", "Rindersalami 200 g", "ES-SALAM-200", "74.50", None, False, 33, ["salam"], "Dilimlenmiş dana salam."),
    ],
    "firin-unlu": [
        ("ekmek", "Tam Buğday Ekmek", "Whole Wheat Bread", "Vollkornbrot", "FR-EKMEK-TB", "18.00", None, False, 100, ["ekmek"], "Günlük taş fırın tam buğday ekmeği."),
        ("simit", "Susamlı Simit", "Sesame Simit", "Sesamkringel", "FR-SIMIT", "12.50", None, True, 70, ["simit"], "Taze, bol susamlı simit."),
        ("un-1kg", "Buğday Unu 1 kg", "Wheat Flour 1 kg", "Weizenmehl 1 kg", "FR-UN-1KG", "26.90", "31.00", False, 90, ["un"], "Çok amaçlı buğday unu."),
        ("makarna", "Spagetti Makarna 500 g", "Spaghetti 500 g", "Spaghetti 500 g", "FR-MAKARNA-500", "17.90", None, False, 140, ["makarna"], "Durum buğdayı irmiğinden spagetti."),
    ],
    "icecek": [
        ("cay-1kg", "Siyah Çay 1 kg", "Black Tea 1 kg", "Schwarzer Tee 1 kg", "IC-CAY-1KG", "224.00", "259.00", False, 50, ["cay"], "Rize yöresi harmanlı siyah çay."),
        ("kola-2l", "Kola 2,5 L", "Cola 2.5 L", "Cola 2,5 L", "IC-KOLA-25", "44.90", None, False, 110, ["kola"], "Ailelik boy gazlı içecek."),
        ("ayran-1l", "Ayran 1 L", "Ayran 1 L", "Ayran 1 L", "IC-AYRAN-1L", "27.50", None, False, 65, ["ayran"], "Yayık ayranı."),
        ("maden-suyu", "Maden Suyu 6'lı", "Sparkling Water (6 pack)", "Mineralwasser 6er", "IC-MADEN-6", "39.90", "46.00", False, 80, ["maden"], "Sade maden suyu, 6 x 200 ml."),
        ("portakal-suyu", "Portakal Suyu 1 L", "Orange Juice 1 L", "Orangensaft 1 L", "IC-PORTAKAL-1L", "49.90", None, True, 40, ["portakal"], "%100 sıkma portakal suyu."),
    ],
    "atistirmalik": [
        ("cikolata", "Sütlü Çikolata 80 g", "Milk Chocolate 80 g", "Milchschokolade 80 g", "AT-CIKOLATA-80", "39.90", None, False, 130, ["cikolata"], "Fındıklı sütlü çikolata."),
        ("cips", "Patates Cipsi 150 g", "Potato Chips 150 g", "Kartoffelchips 150 g", "AT-CIPS-150", "44.90", "52.00", False, 120, ["cips"], "Klasik tuzlu patates cipsi."),
        ("kuruyemis", "Karışık Kuruyemiş 400 g", "Mixed Nuts 400 g", "Nussmischung 400 g", "AT-KURUYEMIS-400", "199.00", None, True, 30, ["kuruyemis"], "Kavrulmuş karışık kuruyemiş."),
        ("biskuvi", "Kakaolu Bisküvi 200 g", "Cocoa Biscuits 200 g", "Kakaokekse 200 g", "AT-BISKUVI-200", "24.90", None, False, 150, ["biskuvi"], "Kakao kremalı sandviç bisküvi."),
    ],
    "temizlik": [
        ("bulasik-det", "Bulaşık Deterjanı 650 ml", "Dish Soap 650 ml", "Spülmittel 650 ml", "TM-BULASIK-650", "54.90", "64.90", False, 75, ["bulasik"], "Limon kokulu elde bulaşık deterjanı."),
        ("camasir-suyu", "Çamaşır Suyu 1 L", "Bleach 1 L", "Bleichmittel 1 L", "TM-CAMASIR-1L", "34.90", None, False, 90, ["camasir"], "Yüzey ve çamaşır için."),
        ("kagit-havlu", "Kağıt Havlu 4'lü", "Paper Towels (4 pack)", "Küchenrolle 4er", "TM-HAVLU-4", "89.90", None, False, 60, ["havlu"], "Çift katlı, emici kağıt havlu."),
        ("sivi-sabun", "Sıvı Sabun 1,5 L", "Liquid Soap 1.5 L", "Flüssigseife 1,5 L", "TM-SABUN-15L", "69.90", "79.90", True, 55, ["sabun"], "Nemlendirici sıvı el sabunu, ekonomik boy."),
    ],
}

STORE_ID = uid("store")
lines = []
lines.append("-- Erenler Market — showcase katalog seed'i (otomatik üretildi: database/seeds/fake-data/generate.py)")
lines.append("-- Idempotent: sabit UUID'ler + ON CONFLICT DO NOTHING. Local ve prod'da güvenle çalışır.")
lines.append("-- Prod: Supabase SQL Editor'da çalıştır.")
lines.append("")
lines.append("BEGIN;")
lines.append("")
lines.append("-- Mağaza profili")
lines.append(textwrap.dedent(f"""\
    UPDATE store_profile SET
      tagline = {j({"tr":"Taze ürünler, kapına kadar","en":"Fresh groceries at your door","de":"Frische Lebensmittel bis an die Tür","fr":"Des produits frais à votre porte","ar":"بقالة طازجة إلى بابك","nl":"Verse boodschappen aan je deur"})},
      description = {j({"tr":"Afyonkarahisar Erenler Mahallesi'nin market'i. Online sipariş ver, aynı gün kapıda öde.","en":"Your neighbourhood market in Afyonkarahisar. Order online, pay at the door the same day.","de":"Dein Nachbarschaftsmarkt in Afyonkarahisar. Online bestellen, am selben Tag an der Tür bezahlen."})},
      city = 'Afyonkarahisar',
      phone = '+90 272 000 00 00',
      address = 'Erenler Mah. Market Cad. No:1, Afyonkarahisar',
      working_hours = {j({"Pazartesi - Cuma": "08:00 – 22:00", "Cumartesi": "08:00 – 22:00", "Pazar": "09:00 – 21:00"})}
    WHERE id = (SELECT id FROM store_profile ORDER BY id LIMIT 1);
"""))

lines.append("-- Kategoriler")
cat_ids = {}
for slug, tr, en, de, order in CATEGORIES:
    cid = uid("cat", slug); cat_ids[slug] = cid
    name = {"tr": tr, "en": en, "de": de}
    lines.append(
        f"INSERT INTO categories (id, name, image_url, display_order) VALUES "
        f"({s(cid)}, {j(name)}, {s(img('cat-'+slug))}, {order}) ON CONFLICT (id) DO NOTHING;"
    )
lines.append("")

lines.append("-- Ürünler + görseller")
for cat_slug, items in PRODUCTS.items():
    cid = cat_ids[cat_slug]
    for (pslug, tr, en, de, sku, price, orig, new, stock, imgs, desc_tr) in items:
        pid = uid("prod", pslug)
        name = {"tr": tr, "en": en, "de": de}
        desc = {"tr": desc_tr, "en": en, "de": de}
        orig_sql = s(orig) if orig else "NULL"
        lines.append(
            f"INSERT INTO products (id, category_id, name, description, sku, price, original_price, is_new_arrival, stock_quantity, is_active) VALUES "
            f"({s(pid)}, {s(cid)}, {j(name)}, {j(desc)}, {s(sku)}, {s(price)}, {orig_sql}, {str(new).lower()}, {stock}, true) "
            f"ON CONFLICT (id) DO NOTHING;"
        )
        for i, islug in enumerate(imgs):
            iid = uid("img", pslug, str(i))
            lines.append(
                f"INSERT INTO product_images (id, product_id, image_url, display_order) VALUES "
                f"({s(iid)}, {s(pid)}, {s(img(pslug+'-'+str(i)))}, {i}) ON CONFLICT (id) DO NOTHING;"
            )
    lines.append("")

lines.append("-- Duyurular")
ann = [
    (uid("ann","1"), {"tr":"Hafta sonu meyve-sebzede %15 indirim!","en":"15% off fruit & veg this weekend!","de":"Dieses Wochenende 15% auf Obst & Gemüse!"},
     {"tr":"Cumartesi ve pazar günü tüm meyve-sebze reyonunda geçerli.","en":"Valid Saturday and Sunday across the produce aisle.","de":"Gültig am Samstag und Sonntag in der Obst- & Gemüseabteilung."}),
    (uid("ann","2"), {"tr":"200 TL üzeri siparişlerde ücretsiz teslimat","en":"Free delivery on orders over 200 TL","de":"Kostenlose Lieferung ab 200 TL"},
     {"tr":"Erenler ve çevre mahallelere aynı gün teslimat.","en":"Same-day delivery to Erenler and nearby neighbourhoods.","de":"Lieferung am selben Tag nach Erenler und Umgebung."}),
]
lines.append("DO $$")
lines.append("DECLARE admin_id uuid;")
lines.append("BEGIN")
lines.append("  SELECT id INTO admin_id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;")
for aid, title, content in ann:
    lines.append(
        f"  INSERT INTO announcements (id, title, content, author_id) VALUES "
        f"({s(aid)}, {j(title)}, {j(content)}, admin_id) ON CONFLICT (id) DO NOTHING;"
    )
lines.append("END $$;")
lines.append("")
lines.append("COMMIT;")
lines.append("")

out = "\n".join(lines)
open("/Volumes/KINGSTON_SSD/MarketApp/database/seeds/fake-data/catalog.sql", "w").write(out)
print(out[:1500])
print("...\n[written]", len(out), "bytes")
