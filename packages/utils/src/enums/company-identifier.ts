import { UInt16 } from "../types/number.js";

/**
 * Source: https://www.bluetooth.com/specifications/assigned-numbers/
 * Last update date: 7 June 2023
 */
export namespace CompanyIdentifier {
  export function nameForId(id?: UInt16): string | undefined {
    switch (id) {
      case 0x0000:
        return "Ericsson AB";
      case 0x0001:
        return "Nokia Mobile Phones";
      case 0x0002:
        return "Intel Corp.";
      case 0x0003:
        return "IBM Corp.";
      case 0x0004:
        return "Toshiba Corp.";
      case 0x0005:
        return "3Com";
      case 0x0006:
        return "Microsoft";
      case 0x0007:
        return "Lucent";
      case 0x0008:
        return "Motorola";
      case 0x0009:
        return "Infineon Technologies AG";
      case 0x000a:
        return "Qualcomm Technologies International, Ltd. (QTIL)";
      case 0x000b:
        return "Silicon Wave";
      case 0x000c:
        return "Digianswer A/S";
      case 0x000d:
        return "Texas Instruments Inc.";
      case 0x000e:
        return "Parthus Technologies Inc.";
      case 0x000f:
        return "Broadcom Corporation";
      case 0x0010:
        return "Mitel Semiconductor";
      case 0x0011:
        return "Widcomm, Inc.";
      case 0x0012:
        return "Zeevo, Inc.";
      case 0x0013:
        return "Atmel Corporation";
      case 0x0014:
        return "Mitsubishi Electric Corporation";
      case 0x0015:
        return "RTX A/S";
      case 0x0016:
        return "KC Technology Inc.";
      case 0x0017:
        return "Newlogic";
      case 0x0018:
        return "Transilica, Inc.";
      case 0x0019:
        return "Rohde & Schwarz GmbH & Co. KG";
      case 0x001a:
        return "TTPCom Limited";
      case 0x001b:
        return "Signia Technologies, Inc.";
      case 0x001c:
        return "Conexant Systems Inc.";
      case 0x001d:
        return "Qualcomm";
      case 0x001e:
        return "Inventel";
      case 0x001f:
        return "AVM Berlin";
      case 0x0020:
        return "BandSpeed, Inc.";
      case 0x0021:
        return "Mansella Ltd";
      case 0x0022:
        return "NEC Corporation";
      case 0x0023:
        return "WavePlus Technology Co., Ltd.";
      case 0x0024:
        return "Alcatel";
      case 0x0025:
        return "NXP B.V.";
      case 0x0026:
        return "C Technologies";
      case 0x0027:
        return "Open Interface";
      case 0x0028:
        return "R F Micro Devices";
      case 0x0029:
        return "Hitachi Ltd";
      case 0x002a:
        return "Symbol Technologies, Inc.";
      case 0x002b:
        return "Tenovis";
      case 0x002c:
        return "Macronix International Co. Ltd.";
      case 0x002d:
        return "GCT Semiconductor";
      case 0x002e:
        return "Norwood Systems";
      case 0x002f:
        return "MewTel Technology Inc.";
      case 0x0030:
        return "ST Microelectronics";
      case 0x0031:
        return "Synopsys, Inc.";
      case 0x0032:
        return "Red-M (Communications) Ltd";
      case 0x0033:
        return "Commil Ltd";
      case 0x0034:
        return "Computer Access Technology Corporation (CATC)";
      case 0x0035:
        return "Eclipse (HQ Espana) S.L.";
      case 0x0036:
        return "Renesas Electronics Corporation";
      case 0x0037:
        return "Mobilian Corporation";
      case 0x0038:
        return "Syntronix Corporation";
      case 0x0039:
        return "Integrated System Solution Corp.";
      case 0x003a:
        return "Panasonic Holdings Corporation";
      case 0x003b:
        return "Gennum Corporation";
      case 0x003c:
        return "BlackBerry Limited";
      case 0x003d:
        return "IPextreme, Inc.";
      case 0x003e:
        return "Systems and Chips, Inc";
      case 0x003f:
        return "Bluetooth SIG, Inc";
      case 0x0040:
        return "Seiko Epson Corporation";
      case 0x0041:
        return "Integrated Silicon Solution Taiwan, Inc.";
      case 0x0042:
        return "CONWISE Technology Corporation Ltd";
      case 0x0043:
        return "PARROT AUTOMOTIVE SAS";
      case 0x0044:
        return "Socket Mobile";
      case 0x0045:
        return "Atheros Communications, Inc.";
      case 0x0046:
        return "MediaTek, Inc.";
      case 0x0047:
        return "Bluegiga";
      case 0x0048:
        return "Marvell Technology Group Ltd.";
      case 0x0049:
        return "3DSP Corporation";
      case 0x004a:
        return "Accel Semiconductor Ltd.";
      case 0x004b:
        return "Continental Automotive Systems";
      case 0x004c:
        return "Apple, Inc.";
      case 0x004d:
        return "Staccato Communications, Inc.";
      case 0x004e:
        return "Avago Technologies";
      case 0x004f:
        return "APT Ltd.";
      case 0x0050:
        return "SiRF Technology, Inc.";
      case 0x0051:
        return "Tzero Technologies, Inc.";
      case 0x0052:
        return "J&M Corporation";
      case 0x0053:
        return "Free2move AB";
      case 0x0054:
        return "3DiJoy Corporation";
      case 0x0055:
        return "Plantronics, Inc.";
      case 0x0056:
        return "Sony Ericsson Mobile Communications";
      case 0x0057:
        return "Harman International Industries, Inc.";
      case 0x0058:
        return "Vizio, Inc.";
      case 0x0059:
        return "Nordic Semiconductor ASA";
      case 0x005a:
        return "EM Microelectronic-Marin SA";
      case 0x005b:
        return "Ralink Technology Corporation";
      case 0x005c:
        return "Belkin International, Inc.";
      case 0x005d:
        return "Realtek Semiconductor Corporation";
      case 0x005e:
        return "Stonestreet One, LLC";
      case 0x005f:
        return "Wicentric, Inc.";
      case 0x0060:
        return "RivieraWaves S.A.S";
      case 0x0061:
        return "RDA Microelectronics";
      case 0x0062:
        return "Gibson Guitars";
      case 0x0063:
        return "MiCommand Inc.";
      case 0x0064:
        return "Band XI International, LLC";
      case 0x0065:
        return "HP, Inc.";
      case 0x0066:
        return "9Solutions Oy";
      case 0x0067:
        return "GN Audio A/S";
      case 0x0068:
        return "General Motors";
      case 0x0069:
        return "A&D Engineering, Inc.";
      case 0x006a:
        return "LTIMINDTREE LIMITED";
      case 0x006b:
        return "Polar Electro OY";
      case 0x006c:
        return "Beautiful Enterprise Co., Ltd.";
      case 0x006d:
        return "BriarTek, Inc";
      case 0x006e:
        return "Summit Data Communications, Inc.";
      case 0x006f:
        return "Sound ID";
      case 0x0070:
        return "Monster, LLC";
      case 0x0071:
        return "connectBlue AB";
      case 0x0072:
        return "ShangHai Super Smart Electronics Co. Ltd.";
      case 0x0073:
        return "Group Sense Ltd.";
      case 0x0074:
        return "Zomm, LLC";
      case 0x0075:
        return "Samsung Electronics Co. Ltd.";
      case 0x0076:
        return "Creative Technology Ltd.";
      case 0x0077:
        return "Laird Connectivity LLC";
      case 0x0078:
        return "Nike, Inc.";
      case 0x0079:
        return "lesswire AG";
      case 0x007a:
        return "MStar Semiconductor, Inc.";
      case 0x007b:
        return "Hanlynn Technologies";
      case 0x007c:
        return "A & R Cambridge";
      case 0x007d:
        return "Seers Technology Co., Ltd.";
      case 0x007e:
        return "Sports Tracking Technologies Ltd.";
      case 0x007f:
        return "Autonet Mobile";
      case 0x0080:
        return "DeLorme Publishing Company, Inc.";
      case 0x0081:
        return "WuXi Vimicro";
      case 0x0082:
        return "DSEA A/S";
      case 0x0083:
        return "TimeKeeping Systems, Inc.";
      case 0x0084:
        return "Ludus Helsinki Ltd.";
      case 0x0085:
        return "BlueRadios, Inc.";
      case 0x0086:
        return "Equinux AG";
      case 0x0087:
        return "Garmin International, Inc.";
      case 0x0088:
        return "Ecotest";
      case 0x0089:
        return "GN Hearing A/S";
      case 0x008a:
        return "Jawbone";
      case 0x008b:
        return "Topcon Positioning Systems, LLC";
      case 0x008c:
        return "Gimbal Inc.";
      case 0x008d:
        return "Zscan Software";
      case 0x008e:
        return "Quintic Corp";
      case 0x008f:
        return "Telit Wireless Solutions GmbH";
      case 0x0090:
        return "Funai Electric Co., Ltd.";
      case 0x0091:
        return "Advanced PANMOBIL systems GmbH & Co. KG";
      case 0x0092:
        return "ThinkOptics, Inc.";
      case 0x0093:
        return "Universal Electronics, Inc.";
      case 0x0094:
        return "Airoha Technology Corp.";
      case 0x0095:
        return "NEC Lighting, Ltd.";
      case 0x0096:
        return "ODM Technology, Inc.";
      case 0x0097:
        return "ConnecteDevice Ltd.";
      case 0x0098:
        return "zero1.tv GmbH";
      case 0x0099:
        return "i.Tech Dynamic Global Distribution Ltd.";
      case 0x009a:
        return "Alpwise";
      case 0x009b:
        return "Jiangsu Toppower Automotive Electronics Co., Ltd.";
      case 0x009c:
        return "Colorfy, Inc.";
      case 0x009d:
        return "Geoforce Inc.";
      case 0x009e:
        return "Bose Corporation";
      case 0x009f:
        return "Suunto Oy";
      case 0x00a0:
        return "Kensington Computer Products Group";
      case 0x00a1:
        return "SR-Medizinelektronik";
      case 0x00a2:
        return "Vertu Corporation Limited";
      case 0x00a3:
        return "Meta Watch Ltd.";
      case 0x00a4:
        return "LINAK A/S";
      case 0x00a5:
        return "OTL Dynamics LLC";
      case 0x00a6:
        return "Panda Ocean Inc.";
      case 0x00a7:
        return "Visteon Corporation";
      case 0x00a8:
        return "ARP Devices Limited";
      case 0x00a9:
        return "MARELLI EUROPE S.P.A.";
      case 0x00aa:
        return "CAEN RFID srl";
      case 0x00ab:
        return "Ingenieur-Systemgruppe Zahn GmbH";
      case 0x00ac:
        return "Green Throttle Games";
      case 0x00ad:
        return "Peter Systemtechnik GmbH";
      case 0x00ae:
        return "Omegawave Oy";
      case 0x00af:
        return "Cinetix";
      case 0x00b0:
        return "Passif Semiconductor Corp";
      case 0x00b1:
        return "Saris Cycling Group, Inc";
      case 0x00b2:
        return "Bekey A/S";
      case 0x00b3:
        return "Clarinox Technologies Pty. Ltd.";
      case 0x00b4:
        return "BDE Technology Co., Ltd.";
      case 0x00b5:
        return "Swirl Networks";
      case 0x00b6:
        return "Meso international";
      case 0x00b7:
        return "TreLab Ltd";
      case 0x00b8:
        return "Qualcomm Innovation Center, Inc. (QuIC)";
      case 0x00b9:
        return "Johnson Controls, Inc.";
      case 0x00ba:
        return "Starkey Hearing Technologies";
      case 0x00bb:
        return "S-Power Electronics Limited";
      case 0x00bc:
        return "Ace Sensor Inc";
      case 0x00bd:
        return "Aplix Corporation";
      case 0x00be:
        return "AAMP of America";
      case 0x00bf:
        return "Stalmart Technology Limited";
      case 0x00c0:
        return "AMICCOM Electronics Corporation";
      case 0x00c1:
        return "Shenzhen Excelsecu Data Technology Co.,Ltd";
      case 0x00c2:
        return "Geneq Inc.";
      case 0x00c3:
        return "adidas AG";
      case 0x00c4:
        return "LG Electronics";
      case 0x00c5:
        return "Onset Computer Corporation";
      case 0x00c6:
        return "Selfly BV";
      case 0x00c7:
        return "Quuppa Oy.";
      case 0x00c8:
        return "GeLo Inc";
      case 0x00c9:
        return "Evluma";
      case 0x00ca:
        return "MC10";
      case 0x00cb:
        return "Binauric SE";
      case 0x00cc:
        return "Beats Electronics";
      case 0x00cd:
        return "Microchip Technology Inc.";
      case 0x00ce:
        return "Eve Systems GmbH";
      case 0x00cf:
        return "ARCHOS SA";
      case 0x00d0:
        return "Dexcom, Inc.";
      case 0x00d1:
        return "Polar Electro Europe B.V.";
      case 0x00d2:
        return "Dialog Semiconductor B.V.";
      case 0x00d3:
        return "Taixingbang Technology (HK) Co,. LTD.";
      case 0x00d4:
        return "Kawantech";
      case 0x00d5:
        return "Austco Communication Systems";
      case 0x00d6:
        return "Timex Group USA, Inc.";
      case 0x00d7:
        return "Qualcomm Technologies, Inc.";
      case 0x00d8:
        return "Qualcomm Connected Experiences, Inc.";
      case 0x00d9:
        return "Voyetra Turtle Beach";
      case 0x00da:
        return "txtr GmbH";
      case 0x00db:
        return "Snuza (Pty) Ltd";
      case 0x00dc:
        return "Procter & Gamble";
      case 0x00dd:
        return "Hosiden Corporation";
      case 0x00de:
        return "Muzik LLC";
      case 0x00df:
        return "Misfit Wearables Corp";
      case 0x00e0:
        return "Google";
      case 0x00e1:
        return "Danlers Ltd";
      case 0x00e2:
        return "Semilink Inc";
      case 0x00e3:
        return "inMusic Brands, Inc";
      case 0x00e4:
        return "L.S. Research, Inc.";
      case 0x00e5:
        return "Eden Software Consultants Ltd.";
      case 0x00e6:
        return "Freshtemp";
      case 0x00e7:
        return "KS Technologies";
      case 0x00e8:
        return "ACTS Technologies";
      case 0x00e9:
        return "Vtrack Systems";
      case 0x00ea:
        return "www.vtracksystems.com";
      case 0x00eb:
        return "Server Technology Inc.";
      case 0x00ec:
        return "BioResearch Associates";
      case 0x00ed:
        return "Jolly Logic, LLC";
      case 0x00ee:
        return "Above Average Outcomes, Inc.";
      case 0x00ef:
        return "Bitsplitters GmbH";
      case 0x00f0:
        return "PayPal, Inc.";
      case 0x00f1:
        return "Witron Technology Limited";
      case 0x00f2:
        return "Morse Project Inc.";
      case 0x00f3:
        return "Kent Displays Inc.";
      case 0x00f4:
        return "Nautilus Inc.";
      case 0x00f5:
        return "Smartifier Oy";
      case 0x00f6:
        return "Elcometer Limited";
      case 0x00f7:
        return "VSN Technologies, Inc.";
      case 0x00f8:
        return "AceUni Corp., Ltd.";
      case 0x00f9:
        return "StickNFind";
      case 0x00fa:
        return "Crystal Alarm AB";
      case 0x00fb:
        return "KOUKAAM a.s.";
      case 0x00fc:
        return "Delphi Corporation";
      case 0x00fd:
        return "ValenceTech Limited";
      case 0x00fe:
        return "Stanley Black and Decker";
      case 0x00ff:
        return "Typo Products, LLC";
      case 0x0100:
        return "TomTom International BV";
      case 0x0101:
        return "Fugoo, Inc.";
      case 0x0102:
        return "Keiser Corporation";
      case 0x0103:
        return "Bang & Olufsen A/S";
      case 0x0104:
        return "PLUS Location Systems Pty Ltd";
      case 0x0105:
        return "Ubiquitous Computing Technology Corporation";
      case 0x0106:
        return "Innovative Yachtter Solutions";
      case 0x0107:
        return "Demant A/S";
      case 0x0108:
        return "Chicony Electronics Co., Ltd.";
      case 0x0109:
        return "Atus BV";
      case 0x010a:
        return "Codegate Ltd";
      case 0x010b:
        return "ERi, Inc";
      case 0x010c:
        return "Transducers Direct, LLC";
      case 0x010d:
        return "DENSO TEN Limited";
      case 0x010e:
        return "Audi AG";
      case 0x010f:
        return "HiSilicon Technologies CO., LIMITED";
      case 0x0110:
        return "Nippon Seiki Co., Ltd.";
      case 0x0111:
        return "Steelseries ApS";
      case 0x0112:
        return "Visybl Inc.";
      case 0x0113:
        return "Openbrain Technologies, Co., Ltd.";
      case 0x0114:
        return "Xensr";
      case 0x0115:
        return "e.solutions";
      case 0x0116:
        return "10AK Technologies";
      case 0x0117:
        return "Wimoto Technologies Inc";
      case 0x0118:
        return "Radius Networks, Inc.";
      case 0x0119:
        return "Wize Technology Co., Ltd.";
      case 0x011a:
        return "Qualcomm Labs, Inc.";
      case 0x011b:
        return "Hewlett Packard Enterprise";
      case 0x011c:
        return "Baidu";
      case 0x011d:
        return "Arendi AG";
      case 0x011e:
        return "Skoda Auto a.s.";
      case 0x011f:
        return "Volkswagen AG";
      case 0x0120:
        return "Porsche AG";
      case 0x0121:
        return "Sino Wealth Electronic Ltd.";
      case 0x0122:
        return "AirTurn, Inc.";
      case 0x0123:
        return "Kinsa, Inc";
      case 0x0124:
        return "HID Global";
      case 0x0125:
        return "SEAT es";
      case 0x0126:
        return "Promethean Ltd.";
      case 0x0127:
        return "Salutica Allied Solutions";
      case 0x0128:
        return "GPSI Group Pty Ltd";
      case 0x0129:
        return "Nimble Devices Oy";
      case 0x012a:
        return "Changzhou Yongse Infotech  Co., Ltd.";
      case 0x012b:
        return "SportIQ";
      case 0x012c:
        return "TEMEC Instruments B.V.";
      case 0x012d:
        return "Sony Corporation";
      case 0x012e:
        return "ASSA ABLOY";
      case 0x012f:
        return "Clarion Co. Inc.";
      case 0x0130:
        return "Warehouse Innovations";
      case 0x0131:
        return "Cypress Semiconductor";
      case 0x0132:
        return "MADS Inc";
      case 0x0133:
        return "Blue Maestro Limited";
      case 0x0134:
        return "Resolution Products, Ltd.";
      case 0x0135:
        return "Aireware LLC";
      case 0x0136:
        return "Silvair, Inc.";
      case 0x0137:
        return "Prestigio Plaza Ltd.";
      case 0x0138:
        return "NTEO Inc.";
      case 0x0139:
        return "Focus Systems Corporation";
      case 0x013a:
        return "Tencent Holdings Ltd.";
      case 0x013b:
        return "Allegion";
      case 0x013c:
        return "Murata Manufacturing Co., Ltd.";
      case 0x013d:
        return "WirelessWERX";
      case 0x013e:
        return "Nod, Inc.";
      case 0x013f:
        return "B&B Manufacturing Company";
      case 0x0140:
        return "Alpine Electronics (China) Co., Ltd";
      case 0x0141:
        return "FedEx Services";
      case 0x0142:
        return "Grape Systems Inc.";
      case 0x0143:
        return "Bkon Connect";
      case 0x0144:
        return "Lintech GmbH";
      case 0x0145:
        return "Novatel Wireless";
      case 0x0146:
        return "Ciright";
      case 0x0147:
        return "Mighty Cast, Inc.";
      case 0x0148:
        return "Ambimat Electronics";
      case 0x0149:
        return "Perytons Ltd.";
      case 0x014a:
        return "Tivoli Audio, LLC";
      case 0x014b:
        return "Master Lock";
      case 0x014c:
        return "Mesh-Net Ltd";
      case 0x014d:
        return "HUIZHOU DESAY SV AUTOMOTIVE CO., LTD.";
      case 0x014e:
        return "Tangerine, Inc.";
      case 0x014f:
        return "B&W Group Ltd.";
      case 0x0150:
        return "Pioneer Corporation";
      case 0x0151:
        return "OnBeep";
      case 0x0152:
        return "Vernier Software & Technology";
      case 0x0153:
        return "ROL Ergo";
      case 0x0154:
        return "Pebble Technology";
      case 0x0155:
        return "NETATMO";
      case 0x0156:
        return "Accumulate AB";
      case 0x0157:
        return "Anhui Huami Information Technology Co., Ltd.";
      case 0x0158:
        return "Inmite s.r.o.";
      case 0x0159:
        return "ChefSteps, Inc.";
      case 0x015a:
        return "micas AG";
      case 0x015b:
        return "Biomedical Research Ltd.";
      case 0x015c:
        return "Pitius Tec S.L.";
      case 0x015d:
        return "Estimote, Inc.";
      case 0x015e:
        return "Unikey Technologies, Inc.";
      case 0x015f:
        return "Timer Cap Co.";
      case 0x0160:
        return "AwoX";
      case 0x0161:
        return "yikes";
      case 0x0162:
        return "MADSGlobalNZ Ltd.";
      case 0x0163:
        return "PCH International";
      case 0x0164:
        return "Qingdao Yeelink Information Technology Co., Ltd.";
      case 0x0165:
        return "Milwaukee Electric Tools";
      case 0x0166:
        return "MISHIK Pte Ltd";
      case 0x0167:
        return "Ascensia Diabetes Care US Inc.";
      case 0x0168:
        return "Spicebox LLC";
      case 0x0169:
        return "emberlight";
      case 0x016a:
        return "Copeland Cold Chain LP";
      case 0x016b:
        return "Qblinks";
      case 0x016c:
        return "MYSPHERA";
      case 0x016d:
        return "LifeScan Inc";
      case 0x016e:
        return "Volantic AB";
      case 0x016f:
        return "Podo Labs, Inc";
      case 0x0170:
        return "Roche Diabetes Care AG";
      case 0x0171:
        return "Amazon.com Services LLC";
      case 0x0172:
        return "Connovate Technology Private Limited";
      case 0x0173:
        return "Kocomojo, LLC";
      case 0x0174:
        return "Everykey Inc.";
      case 0x0175:
        return "Dynamic Controls";
      case 0x0176:
        return "SentriLock";
      case 0x0177:
        return "I-SYST inc.";
      case 0x0178:
        return "CASIO COMPUTER CO., LTD.";
      case 0x0179:
        return "LAPIS Semiconductor Co.,Ltd";
      case 0x017a:
        return "Telemonitor, Inc.";
      case 0x017b:
        return "taskit GmbH";
      case 0x017c:
        return "Mercedes-Benz Group AG";
      case 0x017d:
        return "BatAndCat";
      case 0x017e:
        return "BluDotz Ltd";
      case 0x017f:
        return "XTel Wireless ApS";
      case 0x0180:
        return "Gigaset Technologies GmbH";
      case 0x0181:
        return "Gecko Health Innovations, Inc.";
      case 0x0182:
        return "HOP Ubiquitous";
      case 0x0183:
        return "Walt Disney";
      case 0x0184:
        return "Nectar";
      case 0x0185:
        return "bel'apps LLC";
      case 0x0186:
        return "CORE Lighting Ltd";
      case 0x0187:
        return "Seraphim Sense Ltd";
      case 0x0188:
        return "Unico RBC";
      case 0x0189:
        return "Physical Enterprises Inc.";
      case 0x018a:
        return "Able Trend Technology Limited";
      case 0x018b:
        return "Konica Minolta, Inc.";
      case 0x018c:
        return "Wilo SE";
      case 0x018d:
        return "Extron Design Services";
      case 0x018e:
        return "Google LLC";
      case 0x018f:
        return "Fireflies Systems";
      case 0x0190:
        return "Intelletto Technologies Inc.";
      case 0x0191:
        return "FDK CORPORATION";
      case 0x0192:
        return "Cloudleaf, Inc";
      case 0x0193:
        return "Maveric Automation LLC";
      case 0x0194:
        return "Acoustic Stream Corporation";
      case 0x0195:
        return "Zuli";
      case 0x0196:
        return "Paxton Access Ltd";
      case 0x0197:
        return "WiSilica Inc.";
      case 0x0198:
        return "VENGIT Korlatolt Felelossegu Tarsasag";
      case 0x0199:
        return "SALTO SYSTEMS S.L.";
      case 0x019a:
        return "TRON Forum";
      case 0x019b:
        return "CUBETECH s.r.o.";
      case 0x019c:
        return "Cokiya Incorporated";
      case 0x019d:
        return "CVS Health";
      case 0x019e:
        return "Ceruus";
      case 0x019f:
        return "Strainstall Ltd";
      case 0x01a0:
        return "Channel Enterprises (HK) Ltd.";
      case 0x01a1:
        return "FIAMM";
      case 0x01a2:
        return "GIGALANE.CO.,LTD";
      case 0x01a3:
        return "EROAD";
      case 0x01a4:
        return "MSA Innovation, LLC";
      case 0x01a5:
        return "Icon Health and Fitness";
      case 0x01a6:
        return "Wille Engineering";
      case 0x01a7:
        return "ENERGOUS CORPORATION";
      case 0x01a8:
        return "Taobao";
      case 0x01a9:
        return "Canon Inc.";
      case 0x01aa:
        return "Geophysical Technology Inc.";
      case 0x01ab:
        return "Meta Platforms, Inc.";
      case 0x01ac:
        return "Trividia Health, Inc.";
      case 0x01ad:
        return "FlightSafety International";
      case 0x01ae:
        return "Earlens Corporation";
      case 0x01af:
        return "Sunrise Micro Devices, Inc.";
      case 0x01b0:
        return "Star Micronics Co., Ltd.";
      case 0x01b1:
        return "Netizens Sp. z o.o.";
      case 0x01b2:
        return "Nymi Inc.";
      case 0x01b3:
        return "Nytec, Inc.";
      case 0x01b4:
        return "Trineo Sp. z o.o.";
      case 0x01b5:
        return "Nest Labs Inc.";
      case 0x01b6:
        return "LM Technologies Ltd";
      case 0x01b7:
        return "General Electric Company";
      case 0x01b8:
        return "i+D3 S.L.";
      case 0x01b9:
        return "HANA Micron";
      case 0x01ba:
        return "Stages Cycling LLC";
      case 0x01bb:
        return "Cochlear Bone Anchored Solutions AB";
      case 0x01bc:
        return "SenionLab AB";
      case 0x01bd:
        return "Syszone Co., Ltd";
      case 0x01be:
        return "Pulsate Mobile Ltd.";
      case 0x01bf:
        return "Hongkong OnMicro Electronics Limited";
      case 0x01c0:
        return "pironex GmbH";
      case 0x01c1:
        return "BRADATECH Corp.";
      case 0x01c2:
        return "Transenergooil AG";
      case 0x01c3:
        return "Bunch";
      case 0x01c4:
        return "DME Microelectronics";
      case 0x01c5:
        return "Bitcraze AB";
      case 0x01c6:
        return "HASWARE Inc.";
      case 0x01c7:
        return "Abiogenix Inc.";
      case 0x01c8:
        return "Poly-Control ApS";
      case 0x01c9:
        return "Avi-on";
      case 0x01ca:
        return "Laerdal Medical AS";
      case 0x01cb:
        return "Fetch My Pet";
      case 0x01cc:
        return "Sam Labs Ltd.";
      case 0x01cd:
        return "Chengdu Synwing Technology Ltd";
      case 0x01ce:
        return "HOUWA SYSTEM DESIGN, k.k.";
      case 0x01cf:
        return "BSH";
      case 0x01d0:
        return "Primus Inter Pares Ltd";
      case 0x01d1:
        return "August Home, Inc";
      case 0x01d2:
        return "Gill Electronics";
      case 0x01d3:
        return "Sky Wave Design";
      case 0x01d4:
        return "Newlab S.r.l.";
      case 0x01d5:
        return "ELAD srl";
      case 0x01d6:
        return "G-wearables inc.";
      case 0x01d7:
        return "Squadrone Systems Inc.";
      case 0x01d8:
        return "Code Corporation";
      case 0x01d9:
        return "Savant Systems LLC";
      case 0x01da:
        return "Logitech International SA";
      case 0x01db:
        return "Innblue Consulting";
      case 0x01dc:
        return "iParking Ltd.";
      case 0x01dd:
        return "Koninklijke Philips N.V.";
      case 0x01de:
        return "Minelab Electronics Pty Limited";
      case 0x01df:
        return "Bison Group Ltd.";
      case 0x01e0:
        return "Widex A/S";
      case 0x01e1:
        return "Jolla Ltd";
      case 0x01e2:
        return "Lectronix, Inc.";
      case 0x01e3:
        return "Caterpillar Inc";
      case 0x01e4:
        return "Freedom Innovations";
      case 0x01e5:
        return "Dynamic Devices Ltd";
      case 0x01e6:
        return "Technology Solutions (UK) Ltd";
      case 0x01e7:
        return "IPS Group Inc.";
      case 0x01e8:
        return "STIR";
      case 0x01e9:
        return "Sano, Inc.";
      case 0x01ea:
        return "Advanced Application Design, Inc.";
      case 0x01eb:
        return "AutoMap LLC";
      case 0x01ec:
        return "Spreadtrum Communications Shanghai Ltd";
      case 0x01ed:
        return "CuteCircuit LTD";
      case 0x01ee:
        return "Valeo Service";
      case 0x01ef:
        return "Fullpower Technologies, Inc.";
      case 0x01f0:
        return "KloudNation";
      case 0x01f1:
        return "Zebra Technologies Corporation";
      case 0x01f2:
        return "Itron, Inc.";
      case 0x01f3:
        return "The University of Tokyo";
      case 0x01f4:
        return "UTC Fire and Security";
      case 0x01f5:
        return "Cool Webthings Limited";
      case 0x01f6:
        return "DJO Global";
      case 0x01f7:
        return "Gelliner Limited";
      case 0x01f8:
        return "Anyka (Guangzhou) Microelectronics Technology Co, LTD";
      case 0x01f9:
        return "Medtronic Inc.";
      case 0x01fa:
        return "Gozio Inc.";
      case 0x01fb:
        return "Form Lifting, LLC";
      case 0x01fc:
        return "Wahoo Fitness, LLC";
      case 0x01fd:
        return "Kontakt Micro-Location Sp. z o.o.";
      case 0x01fe:
        return "Radio Systems Corporation";
      case 0x01ff:
        return "Freescale Semiconductor, Inc.";
      case 0x0200:
        return "Verifone Systems Pte Ltd. Taiwan Branch";
      case 0x0201:
        return "AR Timing";
      case 0x0202:
        return "Rigado LLC";
      case 0x0203:
        return "Kemppi Oy";
      case 0x0204:
        return "Tapcentive Inc.";
      case 0x0205:
        return "Smartbotics Inc.";
      case 0x0206:
        return "Otter Products, LLC";
      case 0x0207:
        return "STEMP Inc.";
      case 0x0208:
        return "LumiGeek LLC";
      case 0x0209:
        return "InvisionHeart Inc.";
      case 0x020a:
        return "Macnica Inc.";
      case 0x020b:
        return "Jaguar Land Rover Limited";
      case 0x020c:
        return "CoroWare Technologies, Inc";
      case 0x020d:
        return "Simplo Technology Co., LTD";
      case 0x020e:
        return "Omron Healthcare Co., LTD";
      case 0x020f:
        return "Comodule GMBH";
      case 0x0210:
        return "ikeGPS";
      case 0x0211:
        return "Telink Semiconductor Co. Ltd";
      case 0x0212:
        return "Interplan Co., Ltd";
      case 0x0213:
        return "Wyler AG";
      case 0x0214:
        return "IK Multimedia Production srl";
      case 0x0215:
        return "Lukoton Experience Oy";
      case 0x0216:
        return "MTI Ltd";
      case 0x0217:
        return "Tech4home, Lda";
      case 0x0218:
        return "Hiotech AB";
      case 0x0219:
        return "DOTT Limited";
      case 0x021a:
        return "Blue Speck Labs, LLC";
      case 0x021b:
        return "Cisco Systems, Inc";
      case 0x021c:
        return "Mobicomm Inc";
      case 0x021d:
        return "Edamic";
      case 0x021e:
        return "Goodnet, Ltd";
      case 0x021f:
        return "Luster Leaf Products  Inc";
      case 0x0220:
        return "Manus Machina BV";
      case 0x0221:
        return "Mobiquity Networks Inc";
      case 0x0222:
        return "Praxis Dynamics";
      case 0x0223:
        return "Philip Morris Products S.A.";
      case 0x0224:
        return "Comarch SA";
      case 0x0225:
        return "Nestlé Nespresso S.A.";
      case 0x0226:
        return "Merlinia A/S";
      case 0x0227:
        return "LifeBEAM Technologies";
      case 0x0228:
        return "Twocanoes Labs, LLC";
      case 0x0229:
        return "Muoverti Limited";
      case 0x022a:
        return "Stamer Musikanlagen GMBH";
      case 0x022b:
        return "Tesla, Inc.";
      case 0x022c:
        return "Pharynks Corporation";
      case 0x022d:
        return "Lupine";
      case 0x022e:
        return "Siemens AG";
      case 0x022f:
        return "Huami (Shanghai) Culture Communication CO., LTD";
      case 0x0230:
        return "Foster Electric Company, Ltd";
      case 0x0231:
        return "ETA SA";
      case 0x0232:
        return "x-Senso Solutions Kft";
      case 0x0233:
        return "Shenzhen SuLong Communication Ltd";
      case 0x0234:
        return "FengFan (BeiJing) Technology Co, Ltd";
      case 0x0235:
        return "Qrio Inc";
      case 0x0236:
        return "Pitpatpet Ltd";
      case 0x0237:
        return "MSHeli s.r.l.";
      case 0x0238:
        return "Trakm8 Ltd";
      case 0x0239:
        return "JIN CO, Ltd";
      case 0x023a:
        return "Alatech Tehnology";
      case 0x023b:
        return "Beijing CarePulse Electronic Technology Co, Ltd";
      case 0x023c:
        return "Awarepoint";
      case 0x023d:
        return "ViCentra B.V.";
      case 0x023e:
        return "Raven Industries";
      case 0x023f:
        return "WaveWare Technologies Inc.";
      case 0x0240:
        return "Argenox Technologies";
      case 0x0241:
        return "Bragi GmbH";
      case 0x0242:
        return "16Lab Inc";
      case 0x0243:
        return "Masimo Corp";
      case 0x0244:
        return "Iotera Inc";
      case 0x0245:
        return "Endress+Hauser";
      case 0x0246:
        return "ACKme Networks, Inc.";
      case 0x0247:
        return "FiftyThree Inc.";
      case 0x0248:
        return "Parker Hannifin Corp";
      case 0x0249:
        return "Transcranial Ltd";
      case 0x024a:
        return "Uwatec AG";
      case 0x024b:
        return "Orlan LLC";
      case 0x024c:
        return "Blue Clover Devices";
      case 0x024d:
        return "M-Way Solutions GmbH";
      case 0x024e:
        return "Microtronics Engineering GmbH";
      case 0x024f:
        return "Schneider Schreibgeräte GmbH";
      case 0x0250:
        return "Sapphire Circuits LLC";
      case 0x0251:
        return "Lumo Bodytech Inc.";
      case 0x0252:
        return "UKC Technosolution";
      case 0x0253:
        return "Xicato Inc.";
      case 0x0254:
        return "Playbrush";
      case 0x0255:
        return "Dai Nippon Printing Co., Ltd.";
      case 0x0256:
        return "G24 Power Limited";
      case 0x0257:
        return "AdBabble Local Commerce Inc.";
      case 0x0258:
        return "Devialet SA";
      case 0x0259:
        return "ALTYOR";
      case 0x025a:
        return "University of Applied Sciences Valais/Haute Ecole Valaisanne";
      case 0x025b:
        return "Five Interactive, LLC dba Zendo";
      case 0x025c:
        return "NetEase(Hangzhouï)Network co.Ltd.";
      case 0x025d:
        return "Lexmark International Inc.";
      case 0x025e:
        return "Fluke Corporation";
      case 0x025f:
        return "Yardarm Technologies";
      case 0x0260:
        return "SensaRx";
      case 0x0261:
        return "SECVRE GmbH";
      case 0x0262:
        return "Glacial Ridge Technologies";
      case 0x0263:
        return "Identiv, Inc.";
      case 0x0264:
        return "DDS, Inc.";
      case 0x0265:
        return "SMK Corporation";
      case 0x0266:
        return "Schawbel Technologies LLC";
      case 0x0267:
        return "XMI Systems SA";
      case 0x0268:
        return "Cerevo";
      case 0x0269:
        return "Torrox GmbH & Co KG";
      case 0x026a:
        return "Gemalto";
      case 0x026b:
        return "DEKA Research & Development Corp.";
      case 0x026c:
        return "Domster Tadeusz Szydlowski";
      case 0x026d:
        return "Technogym SPA";
      case 0x026e:
        return "FLEURBAEY BVBA";
      case 0x026f:
        return "Aptcode Solutions";
      case 0x0270:
        return "LSI ADL Technology";
      case 0x0271:
        return "Animas Corp";
      case 0x0272:
        return "Alps Alpine Co., Ltd.";
      case 0x0273:
        return "OCEASOFT";
      case 0x0274:
        return "Motsai Research";
      case 0x0275:
        return "Geotab";
      case 0x0276:
        return "E.G.O. Elektro-Geraetebau GmbH";
      case 0x0277:
        return "bewhere inc";
      case 0x0278:
        return "Johnson Outdoors Inc";
      case 0x0279:
        return "steute Schaltgerate GmbH & Co. KG";
      case 0x027a:
        return "Ekomini inc.";
      case 0x027b:
        return "DEFA AS";
      case 0x027c:
        return "Aseptika Ltd";
      case 0x027d:
        return "HUAWEI Technologies Co., Ltd.";
      case 0x027e:
        return "HabitAware, LLC";
      case 0x027f:
        return "ruwido austria gmbh";
      case 0x0280:
        return "ITEC corporation";
      case 0x0281:
        return "StoneL";
      case 0x0282:
        return "Sonova AG";
      case 0x0283:
        return "Maven Machines, Inc.";
      case 0x0284:
        return "Synapse Electronics";
      case 0x0285:
        return "WOWTech Canada Ltd.";
      case 0x0286:
        return "RF Code, Inc.";
      case 0x0287:
        return "Wally Ventures S.L.";
      case 0x0288:
        return "Willowbank Electronics Ltd";
      case 0x0289:
        return "SK Telecom";
      case 0x028a:
        return "Jetro AS";
      case 0x028b:
        return "Code Gears LTD";
      case 0x028c:
        return "NANOLINK APS";
      case 0x028d:
        return "IF, LLC";
      case 0x028e:
        return "RF Digital Corp";
      case 0x028f:
        return "Church & Dwight Co., Inc";
      case 0x0290:
        return "Multibit Oy";
      case 0x0291:
        return "CliniCloud Inc";
      case 0x0292:
        return "SwiftSensors";
      case 0x0293:
        return "Blue Bite";
      case 0x0294:
        return "ELIAS GmbH";
      case 0x0295:
        return "Sivantos GmbH";
      case 0x0296:
        return "Petzl";
      case 0x0297:
        return "storm power ltd";
      case 0x0298:
        return "EISST Ltd";
      case 0x0299:
        return "Inexess Technology Simma KG";
      case 0x029a:
        return "Currant, Inc.";
      case 0x029b:
        return "C2 Development, Inc.";
      case 0x029c:
        return "Blue Sky Scientific, LLC";
      case 0x029d:
        return "ALOTTAZS LABS, LLC";
      case 0x029e:
        return "Kupson spol. s r.o.";
      case 0x029f:
        return "Areus Engineering GmbH";
      case 0x02a0:
        return "Impossible Camera GmbH";
      case 0x02a1:
        return "InventureTrack Systems";
      case 0x02a2:
        return "Sera4 Ltd.";
      case 0x02a3:
        return "Itude";
      case 0x02a4:
        return "Pacific Lock Company";
      case 0x02a5:
        return "Tendyron Corporation";
      case 0x02a6:
        return "Robert Bosch GmbH";
      case 0x02a7:
        return "Illuxtron international B.V.";
      case 0x02a8:
        return "miSport Ltd.";
      case 0x02a9:
        return "Chargelib";
      case 0x02aa:
        return "Doppler Lab";
      case 0x02ab:
        return "BBPOS Limited";
      case 0x02ac:
        return "RTB Elektronik GmbH & Co. KG";
      case 0x02ad:
        return "Rx Networks, Inc.";
      case 0x02ae:
        return "WeatherFlow, Inc.";
      case 0x02af:
        return "Technicolor USA Inc.";
      case 0x02b0:
        return "Bestechnic(Shanghai),Ltd";
      case 0x02b1:
        return "Raden Inc";
      case 0x02b2:
        return "Oura Health Oy";
      case 0x02b3:
        return "CLABER S.P.A.";
      case 0x02b4:
        return "Hyginex, Inc.";
      case 0x02b5:
        return "HANSHIN ELECTRIC RAILWAY CO.,LTD.";
      case 0x02b6:
        return "Schneider Electric";
      case 0x02b7:
        return "Oort Technologies LLC";
      case 0x02b8:
        return "Chrono Therapeutics";
      case 0x02b9:
        return "Rinnai Corporation";
      case 0x02ba:
        return "Swissprime Technologies AG";
      case 0x02bb:
        return "Koha.,Co.Ltd";
      case 0x02bc:
        return "Genevac Ltd";
      case 0x02bd:
        return "Chemtronics";
      case 0x02be:
        return "Seguro Technology Sp. z o.o.";
      case 0x02bf:
        return "Redbird Flight Simulations";
      case 0x02c0:
        return "Dash Robotics";
      case 0x02c1:
        return "LINE Corporation";
      case 0x02c2:
        return "Guillemot Corporation";
      case 0x02c3:
        return "Techtronic Power Tools Technology Limited";
      case 0x02c4:
        return "Wilson Sporting Goods";
      case 0x02c5:
        return "Lenovo (Singapore) Pte Ltd.";
      case 0x02c6:
        return "Ayatan Sensors";
      case 0x02c7:
        return "Electronics Tomorrow Limited";
      case 0x02c8:
        return "OneSpan";
      case 0x02c9:
        return "PayRange Inc.";
      case 0x02ca:
        return "ABOV Semiconductor";
      case 0x02cb:
        return "AINA-Wireless Inc.";
      case 0x02cc:
        return "Eijkelkamp Soil & Water";
      case 0x02cd:
        return "BMA ergonomics b.v.";
      case 0x02ce:
        return "Teva Branded Pharmaceutical Products R&D, Inc.";
      case 0x02cf:
        return "Anima";
      case 0x02d0:
        return "3M";
      case 0x02d1:
        return "Empatica Srl";
      case 0x02d2:
        return "Afero, Inc.";
      case 0x02d3:
        return "Powercast Corporation";
      case 0x02d4:
        return "Secuyou ApS";
      case 0x02d5:
        return "OMRON Corporation";
      case 0x02d6:
        return "Send Solutions";
      case 0x02d7:
        return "NIPPON SYSTEMWARE CO.,LTD.";
      case 0x02d8:
        return "Neosfar";
      case 0x02d9:
        return "Fliegl Agrartechnik GmbH";
      case 0x02da:
        return "Gilvader";
      case 0x02db:
        return "Digi International Inc (R)";
      case 0x02dc:
        return "DeWalch Technologies, Inc.";
      case 0x02dd:
        return "Flint Rehabilitation Devices, LLC";
      case 0x02de:
        return "Samsung SDS Co., Ltd.";
      case 0x02df:
        return "Blur Product Development";
      case 0x02e0:
        return "University of Michigan";
      case 0x02e1:
        return "Victron Energy BV";
      case 0x02e2:
        return "NTT docomo";
      case 0x02e3:
        return "Carmanah Technologies Corp.";
      case 0x02e4:
        return "Bytestorm Ltd.";
      case 0x02e5:
        return "Espressif Systems (Shanghai) Co., Ltd.";
      case 0x02e6:
        return "Unwire";
      case 0x02e7:
        return "Connected Yard, Inc.";
      case 0x02e8:
        return "American Music Environments";
      case 0x02e9:
        return "Sensogram Technologies, Inc.";
      case 0x02ea:
        return "Fujitsu Limited";
      case 0x02eb:
        return "Ardic Technology";
      case 0x02ec:
        return "Delta Systems, Inc";
      case 0x02ed:
        return "HTC Corporation";
      case 0x02ee:
        return "Citizen Holdings Co., Ltd.";
      case 0x02ef:
        return "SMART-INNOVATION.inc";
      case 0x02f0:
        return "Blackrat Software";
      case 0x02f1:
        return "The Idea Cave, LLC";
      case 0x02f2:
        return "GoPro, Inc.";
      case 0x02f3:
        return "AuthAir, Inc";
      case 0x02f4:
        return "Vensi, Inc.";
      case 0x02f5:
        return "Indagem Tech LLC";
      case 0x02f6:
        return "Intemo Technologies";
      case 0x02f7:
        return "DreamVisions co., Ltd.";
      case 0x02f8:
        return "Runteq Oy Ltd";
      case 0x02f9:
        return "IMAGINATION TECHNOLOGIES LTD";
      case 0x02fa:
        return "CoSTAR TEchnologies";
      case 0x02fb:
        return "Clarius Mobile Health Corp.";
      case 0x02fc:
        return "Shanghai Frequen Microelectronics Co., Ltd.";
      case 0x02fd:
        return "Uwanna, Inc.";
      case 0x02fe:
        return "Lierda Science & Technology Group Co., Ltd.";
      case 0x02ff:
        return "Silicon Laboratories";
      case 0x0300:
        return "World Moto Inc.";
      case 0x0301:
        return "Giatec Scientific Inc.";
      case 0x0302:
        return "Loop Devices, Inc";
      case 0x0303:
        return "IACA electronique";
      case 0x0304:
        return "Oura Health Ltd";
      case 0x0305:
        return "Swipp ApS";
      case 0x0306:
        return "Life Laboratory Inc.";
      case 0x0307:
        return "FUJI INDUSTRIAL CO.,LTD.";
      case 0x0308:
        return "Surefire, LLC";
      case 0x0309:
        return "Dolby Labs";
      case 0x030a:
        return "Ellisys";
      case 0x030b:
        return "Magnitude Lighting Converters";
      case 0x030c:
        return "Hilti AG";
      case 0x030d:
        return "Devdata S.r.l.";
      case 0x030e:
        return "Deviceworx";
      case 0x030f:
        return "Shortcut Labs";
      case 0x0310:
        return "SGL Italia S.r.l.";
      case 0x0311:
        return "PEEQ DATA";
      case 0x0312:
        return "Ducere Technologies Pvt Ltd";
      case 0x0313:
        return "DiveNav, Inc.";
      case 0x0314:
        return "RIIG AI Sp. z o.o.";
      case 0x0315:
        return "Thermo Fisher Scientific";
      case 0x0316:
        return "AG Measurematics Pvt. Ltd.";
      case 0x0317:
        return "CHUO Electronics CO., LTD.";
      case 0x0318:
        return "Aspenta International";
      case 0x0319:
        return "Eugster Frismag AG";
      case 0x031a:
        return "Wurth Elektronik eiSos GmbH & Co. KG";
      case 0x031b:
        return "HQ Inc";
      case 0x031c:
        return "Lab Sensor Solutions";
      case 0x031d:
        return "Enterlab ApS";
      case 0x031e:
        return "Eyefi, Inc.";
      case 0x031f:
        return "MetaSystem S.p.A.";
      case 0x0320:
        return "SONO ELECTRONICS. CO., LTD";
      case 0x0321:
        return "Jewelbots";
      case 0x0322:
        return "Compumedics Limited";
      case 0x0323:
        return "Rotor Bike Components";
      case 0x0324:
        return "Astro, Inc.";
      case 0x0325:
        return "Amotus Solutions";
      case 0x0326:
        return "Healthwear Technologies (Changzhou)Ltd";
      case 0x0327:
        return "Essex Electronics";
      case 0x0328:
        return "Grundfos A/S";
      case 0x0329:
        return "Eargo, Inc.";
      case 0x032a:
        return "Electronic Design Lab";
      case 0x032b:
        return "ESYLUX";
      case 0x032c:
        return "NIPPON SMT.CO.,Ltd";
      case 0x032d:
        return "BM innovations GmbH";
      case 0x032e:
        return "indoormap";
      case 0x032f:
        return "OttoQ Inc";
      case 0x0330:
        return "North Pole Engineering";
      case 0x0331:
        return "3flares Technologies Inc.";
      case 0x0332:
        return "Electrocompaniet A.S.";
      case 0x0333:
        return "Mul-T-Lock";
      case 0x0334:
        return "Airthings ASA";
      case 0x0335:
        return "Enlighted Inc";
      case 0x0336:
        return "GISTIC";
      case 0x0337:
        return "AJP2 Holdings, LLC";
      case 0x0338:
        return "COBI GmbH";
      case 0x0339:
        return "Blue Sky Scientific, LLC";
      case 0x033a:
        return "Appception, Inc.";
      case 0x033b:
        return "Courtney Thorne Limited";
      case 0x033c:
        return "Virtuosys";
      case 0x033d:
        return "TPV Technology Limited";
      case 0x033e:
        return "Monitra SA";
      case 0x033f:
        return "Automation Components, Inc.";
      case 0x0340:
        return "Letsense s.r.l.";
      case 0x0341:
        return "Etesian Technologies LLC";
      case 0x0342:
        return "GERTEC BRASIL LTDA.";
      case 0x0343:
        return "Drekker Development Pty. Ltd.";
      case 0x0344:
        return "Whirl Inc";
      case 0x0345:
        return "Locus Positioning";
      case 0x0346:
        return "Acuity Brands Lighting, Inc";
      case 0x0347:
        return "Prevent Biometrics";
      case 0x0348:
        return "Arioneo";
      case 0x0349:
        return "VersaMe";
      case 0x034a:
        return "Vaddio";
      case 0x034b:
        return "Libratone A/S";
      case 0x034c:
        return "HM Electronics, Inc.";
      case 0x034d:
        return "TASER International, Inc.";
      case 0x034e:
        return "SafeTrust Inc.";
      case 0x034f:
        return "Heartland Payment Systems";
      case 0x0350:
        return "Bitstrata Systems Inc.";
      case 0x0351:
        return "Pieps GmbH";
      case 0x0352:
        return "iRiding(Xiamen)Technology Co.,Ltd.";
      case 0x0353:
        return "Alpha Audiotronics, Inc.";
      case 0x0354:
        return "TOPPAN FORMS CO.,LTD.";
      case 0x0355:
        return "Sigma Designs, Inc.";
      case 0x0356:
        return "Spectrum Brands, Inc.";
      case 0x0357:
        return "Polymap Wireless";
      case 0x0358:
        return "MagniWare Ltd.";
      case 0x0359:
        return "Novotec Medical GmbH";
      case 0x035a:
        return "Phillips-Medisize A/S";
      case 0x035b:
        return "Matrix Inc.";
      case 0x035c:
        return "Eaton Corporation";
      case 0x035d:
        return "KYS";
      case 0x035e:
        return "Naya Health, Inc.";
      case 0x035f:
        return "Acromag";
      case 0x0360:
        return "Insulet Corporation";
      case 0x0361:
        return "Wellinks Inc.";
      case 0x0362:
        return "ON Semiconductor";
      case 0x0363:
        return "FREELAP SA";
      case 0x0364:
        return "Favero Electronics Srl";
      case 0x0365:
        return "BioMech Sensor LLC";
      case 0x0366:
        return "BOLTT Sports technologies Private limited";
      case 0x0367:
        return "Saphe International";
      case 0x0368:
        return "Metormote AB";
      case 0x0369:
        return "littleBits";
      case 0x036a:
        return "SetPoint Medical";
      case 0x036b:
        return "BRControls Products BV";
      case 0x036c:
        return "Zipcar";
      case 0x036d:
        return "AirBolt Pty Ltd";
      case 0x036e:
        return "MOTIVE TECHNOLOGIES, INC.";
      case 0x036f:
        return "Motiv, Inc.";
      case 0x0370:
        return "Wazombi Labs OÃœ";
      case 0x0371:
        return "ORBCOMM";
      case 0x0372:
        return "Nixie Labs, Inc.";
      case 0x0373:
        return "AppNearMe Ltd";
      case 0x0374:
        return "Holman Industries";
      case 0x0375:
        return "Expain AS";
      case 0x0376:
        return "Electronic Temperature Instruments Ltd";
      case 0x0377:
        return "Plejd AB";
      case 0x0378:
        return "Propeller Health";
      case 0x0379:
        return "Shenzhen iMCO Electronic Technology Co.,Ltd";
      case 0x037a:
        return "Algoria";
      case 0x037b:
        return "Apption Labs Inc.";
      case 0x037c:
        return "Cronologics Corporation";
      case 0x037d:
        return "MICRODIA Ltd.";
      case 0x037e:
        return "lulabytes S.L.";
      case 0x037f:
        return "Société des Produits Nestlé S.A.";
      case 0x0380:
        return 'LLC "MEGA-F service"';
      case 0x0381:
        return "Sharp Corporation";
      case 0x0382:
        return "Precision Outcomes Ltd";
      case 0x0383:
        return "Kronos Incorporated";
      case 0x0384:
        return "OCOSMOS Co., Ltd.";
      case 0x0385:
        return "Embedded Electronic Solutions Ltd. dba e2Solutions";
      case 0x0386:
        return "Aterica Inc.";
      case 0x0387:
        return "BluStor PMC, Inc.";
      case 0x0388:
        return "Kapsch TrafficCom AB";
      case 0x0389:
        return "ActiveBlu Corporation";
      case 0x038a:
        return "Kohler Mira Limited";
      case 0x038b:
        return "Noke";
      case 0x038c:
        return "Appion Inc.";
      case 0x038d:
        return "Resmed Ltd";
      case 0x038e:
        return "Crownstone B.V.";
      case 0x038f:
        return "Xiaomi Inc.";
      case 0x0390:
        return "INFOTECH s.r.o.";
      case 0x0391:
        return "Thingsquare AB";
      case 0x0392:
        return "T&D";
      case 0x0393:
        return "LAVAZZA S.p.A.";
      case 0x0394:
        return "Netclearance Systems, Inc.";
      case 0x0395:
        return "SDATAWAY";
      case 0x0396:
        return "BLOKS GmbH";
      case 0x0397:
        return "LEGO System A/S";
      case 0x0398:
        return "Thetatronics Ltd";
      case 0x0399:
        return "Nikon Corporation";
      case 0x039a:
        return "NeST";
      case 0x039b:
        return "South Silicon Valley Microelectronics";
      case 0x039c:
        return "ALE International";
      case 0x039d:
        return "CareView Communications, Inc.";
      case 0x039e:
        return "SchoolBoard Limited";
      case 0x039f:
        return "Molex Corporation";
      case 0x03a0:
        return "IVT Wireless Limited";
      case 0x03a1:
        return "Alpine Labs LLC";
      case 0x03a2:
        return "Candura Instruments";
      case 0x03a3:
        return "SmartMovt Technology Co., Ltd";
      case 0x03a4:
        return "Token Zero Ltd";
      case 0x03a5:
        return "ACE CAD Enterprise Co., Ltd. (ACECAD)";
      case 0x03a6:
        return "Medela, Inc";
      case 0x03a7:
        return "AeroScout";
      case 0x03a8:
        return "Esrille Inc.";
      case 0x03a9:
        return "THINKERLY SRL";
      case 0x03aa:
        return "Exon Sp. z o.o.";
      case 0x03ab:
        return "Meizu Technology Co., Ltd.";
      case 0x03ac:
        return "Smablo LTD";
      case 0x03ad:
        return "XiQ";
      case 0x03ae:
        return "Allswell Inc.";
      case 0x03af:
        return "Comm-N-Sense Corp DBA Verigo";
      case 0x03b0:
        return "VIBRADORM GmbH";
      case 0x03b1:
        return "Otodata Wireless Network Inc.";
      case 0x03b2:
        return "Propagation Systems Limited";
      case 0x03b3:
        return "Midwest Instruments & Controls";
      case 0x03b4:
        return "Alpha Nodus, inc.";
      case 0x03b5:
        return "petPOMM, Inc";
      case 0x03b6:
        return "Mattel";
      case 0x03b7:
        return "Airbly Inc.";
      case 0x03b8:
        return "A-Safe Limited";
      case 0x03b9:
        return "FREDERIQUE CONSTANT SA";
      case 0x03ba:
        return "Maxscend Microelectronics Company Limited";
      case 0x03bb:
        return "Abbott";
      case 0x03bc:
        return "ASB Bank Ltd";
      case 0x03bd:
        return "amadas";
      case 0x03be:
        return "Applied Science, Inc.";
      case 0x03bf:
        return "iLumi Solutions Inc.";
      case 0x03c0:
        return "Arch Systems Inc.";
      case 0x03c1:
        return "Ember Technologies, Inc.";
      case 0x03c2:
        return "Snapchat Inc";
      case 0x03c3:
        return "Casambi Technologies Oy";
      case 0x03c4:
        return "Pico Technology Inc.";
      case 0x03c5:
        return "St. Jude Medical, Inc.";
      case 0x03c6:
        return "Intricon";
      case 0x03c7:
        return "Structural Health Systems, Inc.";
      case 0x03c8:
        return "Avvel International";
      case 0x03c9:
        return "Gallagher Group";
      case 0x03ca:
        return "In2things Automation Pvt. Ltd.";
      case 0x03cb:
        return "SYSDEV Srl";
      case 0x03cc:
        return "Vonkil Technologies Ltd";
      case 0x03cd:
        return "Wynd Technologies, Inc.";
      case 0x03ce:
        return "CONTRINEX S.A.";
      case 0x03cf:
        return "MIRA, Inc.";
      case 0x03d0:
        return "Watteam Ltd";
      case 0x03d1:
        return "Density Inc.";
      case 0x03d2:
        return "IOT Pot India Private Limited";
      case 0x03d3:
        return "Sigma Connectivity AB";
      case 0x03d4:
        return "PEG PEREGO SPA";
      case 0x03d5:
        return "Wyzelink Systems Inc.";
      case 0x03d6:
        return "Yota Devices LTD";
      case 0x03d7:
        return "FINSECUR";
      case 0x03d8:
        return "Zen-Me Labs Ltd";
      case 0x03d9:
        return "3IWare Co., Ltd.";
      case 0x03da:
        return "EnOcean GmbH";
      case 0x03db:
        return "Instabeat, Inc";
      case 0x03dc:
        return "Nima Labs";
      case 0x03dd:
        return "Andreas Stihl AG & Co. KG";
      case 0x03de:
        return "Nathan Rhoades LLC";
      case 0x03df:
        return "Grob Technologies, LLC";
      case 0x03e0:
        return "Actions (Zhuhai) Technology Co., Limited";
      case 0x03e1:
        return "SPD Development Company Ltd";
      case 0x03e2:
        return "Sensoan Oy";
      case 0x03e3:
        return "Qualcomm Life Inc";
      case 0x03e4:
        return "Chip-ing AG";
      case 0x03e5:
        return "ffly4u";
      case 0x03e6:
        return "IoT Instruments Oy";
      case 0x03e7:
        return "TRUE Fitness Technology";
      case 0x03e8:
        return "Reiner Kartengeraete GmbH & Co. KG.";
      case 0x03e9:
        return "SHENZHEN LEMONJOY TECHNOLOGY CO., LTD.";
      case 0x03ea:
        return "Hello Inc.";
      case 0x03eb:
        return "Ozo Edu, Inc.";
      case 0x03ec:
        return "Jigowatts Inc.";
      case 0x03ed:
        return "BASIC MICRO.COM,INC.";
      case 0x03ee:
        return "CUBE TECHNOLOGIES";
      case 0x03ef:
        return "foolography GmbH";
      case 0x03f0:
        return "CLINK";
      case 0x03f1:
        return "Hestan Smart Cooking Inc.";
      case 0x03f2:
        return "WindowMaster A/S";
      case 0x03f3:
        return "Flowscape AB";
      case 0x03f4:
        return "PAL Technologies Ltd";
      case 0x03f5:
        return "WHERE, Inc.";
      case 0x03f6:
        return "Iton Technology Corp.";
      case 0x03f7:
        return "Owl Labs Inc.";
      case 0x03f8:
        return "Rockford Corp.";
      case 0x03f9:
        return "Becon Technologies Co.,Ltd.";
      case 0x03fa:
        return "Vyassoft Technologies Inc";
      case 0x03fb:
        return "Nox Medical";
      case 0x03fc:
        return "Kimberly-Clark";
      case 0x03fd:
        return "Trimble Inc.";
      case 0x03fe:
        return "Littelfuse";
      case 0x03ff:
        return "Withings";
      case 0x0400:
        return "i-developer IT Beratung UG";
      case 0x0401:
        return "Relations Inc.";
      case 0x0402:
        return "Sears Holdings Corporation";
      case 0x0403:
        return "Gantner Electronic GmbH";
      case 0x0404:
        return "Authomate Inc";
      case 0x0405:
        return "Vertex International, Inc.";
      case 0x0406:
        return "Airtago";
      case 0x0407:
        return "Swiss Audio SA";
      case 0x0408:
        return "ToGetHome Inc.";
      case 0x0409:
        return "RYSE INC.";
      case 0x040a:
        return "ZF OPENMATICS s.r.o.";
      case 0x040b:
        return "Jana Care Inc.";
      case 0x040c:
        return "Senix Corporation";
      case 0x040d:
        return "NorthStar Battery Company, LLC";
      case 0x040e:
        return "SKF (U.K.) Limited";
      case 0x040f:
        return "CO-AX Technology, Inc.";
      case 0x0410:
        return "Fender Musical Instruments";
      case 0x0411:
        return "Luidia Inc";
      case 0x0412:
        return "SEFAM";
      case 0x0413:
        return "Wireless Cables Inc";
      case 0x0414:
        return "Lightning Protection International Pty Ltd";
      case 0x0415:
        return "Uber Technologies Inc";
      case 0x0416:
        return "SODA GmbH";
      case 0x0417:
        return "Fatigue Science";
      case 0x0418:
        return "Reserved";
      case 0x0419:
        return "Novalogy LTD";
      case 0x041a:
        return "Friday Labs Limited";
      case 0x041b:
        return "OrthoAccel Technologies";
      case 0x041c:
        return "WaterGuru, Inc.";
      case 0x041d:
        return "Benning Elektrotechnik und Elektronik GmbH & Co. KG";
      case 0x041e:
        return "Dell Computer Corporation";
      case 0x041f:
        return "Kopin Corporation";
      case 0x0420:
        return "TecBakery GmbH";
      case 0x0421:
        return "Backbone Labs, Inc.";
      case 0x0422:
        return "DELSEY SA";
      case 0x0423:
        return "Chargifi Limited";
      case 0x0424:
        return "Trainesense Ltd.";
      case 0x0425:
        return "Unify Software and Solutions GmbH & Co. KG";
      case 0x0426:
        return "Husqvarna AB";
      case 0x0427:
        return "Focus fleet and fuel management inc";
      case 0x0428:
        return "SmallLoop, LLC";
      case 0x0429:
        return "Prolon Inc.";
      case 0x042a:
        return "BD Medical";
      case 0x042b:
        return "iMicroMed Incorporated";
      case 0x042c:
        return "Ticto N.V.";
      case 0x042d:
        return "Meshtech AS";
      case 0x042e:
        return "MemCachier Inc.";
      case 0x042f:
        return "Danfoss A/S";
      case 0x0430:
        return "SnapStyk Inc.";
      case 0x0431:
        return "Alticor Inc.";
      case 0x0432:
        return "Silk Labs, Inc.";
      case 0x0433:
        return "Pillsy Inc.";
      case 0x0434:
        return "Hatch Baby, Inc.";
      case 0x0435:
        return "Blocks Wearables Ltd.";
      case 0x0436:
        return "Drayson Technologies (Europe) Limited";
      case 0x0437:
        return "eBest IOT Inc.";
      case 0x0438:
        return "Helvar Ltd";
      case 0x0439:
        return "Radiance Technologies";
      case 0x043a:
        return "Nuheara Limited";
      case 0x043b:
        return "Appside co., ltd.";
      case 0x043c:
        return "DeLaval";
      case 0x043d:
        return "Coiler Corporation";
      case 0x043e:
        return "Thermomedics, Inc.";
      case 0x043f:
        return "Tentacle Sync GmbH";
      case 0x0440:
        return "Valencell, Inc.";
      case 0x0441:
        return "iProtoXi Oy";
      case 0x0442:
        return "SECOM CO., LTD.";
      case 0x0443:
        return "Tucker International LLC";
      case 0x0444:
        return "Metanate Limited";
      case 0x0445:
        return "Kobian Canada Inc.";
      case 0x0446:
        return "NETGEAR, Inc.";
      case 0x0447:
        return "Fabtronics Australia Pty Ltd";
      case 0x0448:
        return "Grand Centrix GmbH";
      case 0x0449:
        return "1UP USA.com llc";
      case 0x044a:
        return "SHIMANO INC.";
      case 0x044b:
        return "Nain Inc.";
      case 0x044c:
        return "LifeStyle Lock, LLC";
      case 0x044d:
        return "VEGA Grieshaber KG";
      case 0x044e:
        return "Xtrava Inc.";
      case 0x044f:
        return "TTS Tooltechnic Systems AG & Co. KG";
      case 0x0450:
        return "Teenage Engineering AB";
      case 0x0451:
        return "Tunstall Nordic AB";
      case 0x0452:
        return "Svep Design Center AB";
      case 0x0453:
        return "Qorvo Utrecht B.V.";
      case 0x0454:
        return "Sphinx Electronics GmbH & Co KG";
      case 0x0455:
        return "Atomation";
      case 0x0456:
        return "Nemik Consulting Inc";
      case 0x0457:
        return "RF INNOVATION";
      case 0x0458:
        return "Mini Solution Co., Ltd.";
      case 0x0459:
        return "Lumenetix, Inc";
      case 0x045a:
        return "2048450 Ontario Inc";
      case 0x045b:
        return "SPACEEK LTD";
      case 0x045c:
        return "Delta T Corporation";
      case 0x045d:
        return "Boston Scientific Corporation";
      case 0x045e:
        return "Nuviz, Inc.";
      case 0x045f:
        return "Real Time Automation, Inc.";
      case 0x0460:
        return "Kolibree";
      case 0x0461:
        return "vhf elektronik GmbH";
      case 0x0462:
        return "Bonsai Systems GmbH";
      case 0x0463:
        return "Fathom Systems Inc.";
      case 0x0464:
        return "Bellman & Symfon Group AB";
      case 0x0465:
        return "International Forte Group LLC";
      case 0x0466:
        return "CycleLabs Solutions inc.";
      case 0x0467:
        return "Codenex Oy";
      case 0x0468:
        return "Kynesim Ltd";
      case 0x0469:
        return "Palago AB";
      case 0x046a:
        return "INSIGMA INC.";
      case 0x046b:
        return "PMD Solutions";
      case 0x046c:
        return "Qingdao Realtime Technology Co., Ltd.";
      case 0x046d:
        return "BEGA Gantenbrink-Leuchten KG";
      case 0x046e:
        return "Pambor Ltd.";
      case 0x046f:
        return "Develco Products A/S";
      case 0x0470:
        return "iDesign s.r.l.";
      case 0x0471:
        return "TiVo Corp";
      case 0x0472:
        return "Control-J Pty Ltd";
      case 0x0473:
        return "Steelcase, Inc.";
      case 0x0474:
        return "iApartment co., ltd.";
      case 0x0475:
        return "Icom inc.";
      case 0x0476:
        return "Oxstren Wearable Technologies Private Limited";
      case 0x0477:
        return "Blue Spark Technologies";
      case 0x0478:
        return "FarSite Communications Limited";
      case 0x0479:
        return "mywerk system GmbH";
      case 0x047a:
        return "Sinosun Technology Co., Ltd.";
      case 0x047b:
        return "MIYOSHI ELECTRONICS CORPORATION";
      case 0x047c:
        return "POWERMAT LTD";
      case 0x047d:
        return "Occly LLC";
      case 0x047e:
        return "OurHub Dev IvS";
      case 0x047f:
        return "Pro-Mark, Inc.";
      case 0x0480:
        return "Dynometrics Inc.";
      case 0x0481:
        return "Quintrax Limited";
      case 0x0482:
        return "POS Tuning Udo Vosshenrich GmbH & Co. KG";
      case 0x0483:
        return "Multi Care Systems B.V.";
      case 0x0484:
        return "Revol Technologies Inc";
      case 0x0485:
        return "SKIDATA AG";
      case 0x0486:
        return "DEV TECNOLOGIA INDUSTRIA, COMERCIO E MANUTENCAO DE EQUIPAMENTOS LTDA. - ME";
      case 0x0487:
        return "Centrica Connected Home";
      case 0x0488:
        return "Automotive Data Solutions Inc";
      case 0x0489:
        return "Igarashi Engineering";
      case 0x048a:
        return "Taelek Oy";
      case 0x048b:
        return "CP Electronics Limited";
      case 0x048c:
        return "Vectronix AG";
      case 0x048d:
        return "S-Labs Sp. z o.o.";
      case 0x048e:
        return "Companion Medical, Inc.";
      case 0x048f:
        return "BlueKitchen GmbH";
      case 0x0490:
        return "Matting AB";
      case 0x0491:
        return "SOREX - Wireless Solutions GmbH";
      case 0x0492:
        return "ADC Technology, Inc.";
      case 0x0493:
        return "Lynxemi Pte Ltd";
      case 0x0494:
        return "SENNHEISER electronic GmbH & Co. KG";
      case 0x0495:
        return "LMT Mercer Group, Inc";
      case 0x0496:
        return "Polymorphic Labs LLC";
      case 0x0497:
        return "Cochlear Limited";
      case 0x0498:
        return "METER Group, Inc. USA";
      case 0x0499:
        return "Ruuvi Innovations Ltd.";
      case 0x049a:
        return "Situne AS";
      case 0x049b:
        return "nVisti, LLC";
      case 0x049c:
        return "DyOcean";
      case 0x049d:
        return "Uhlmann & Zacher GmbH";
      case 0x049e:
        return "AND!XOR LLC";
      case 0x049f:
        return "Popper Pay AB";
      case 0x04a0:
        return "Vypin, LLC";
      case 0x04a1:
        return "PNI Sensor Corporation";
      case 0x04a2:
        return "ovrEngineered, LLC";
      case 0x04a3:
        return "GT-tronics HK Ltd";
      case 0x04a4:
        return "Herbert Waldmann GmbH & Co. KG";
      case 0x04a5:
        return "Guangzhou FiiO Electronics Technology Co.,Ltd";
      case 0x04a6:
        return "Vinetech Co., Ltd";
      case 0x04a7:
        return "Dallas Logic Corporation";
      case 0x04a8:
        return "BioTex, Inc.";
      case 0x04a9:
        return "DISCOVERY SOUND TECHNOLOGY, LLC";
      case 0x04aa:
        return "LINKIO SAS";
      case 0x04ab:
        return "Harbortronics, Inc.";
      case 0x04ac:
        return "Undagrid B.V.";
      case 0x04ad:
        return "Shure Inc";
      case 0x04ae:
        return "ERM Electronic Systems LTD";
      case 0x04af:
        return "BIOROWER Handelsagentur GmbH";
      case 0x04b0:
        return "Weba Sport und Med. Artikel GmbH";
      case 0x04b1:
        return "Kartographers Technologies Pvt. Ltd.";
      case 0x04b2:
        return "The Shadow on the Moon";
      case 0x04b3:
        return "mobike (Hong Kong) Limited";
      case 0x04b4:
        return "Inuheat Group AB";
      case 0x04b5:
        return "Swiftronix AB";
      case 0x04b6:
        return "Diagnoptics Technologies";
      case 0x04b7:
        return "Analog Devices, Inc.";
      case 0x04b8:
        return "Soraa Inc.";
      case 0x04b9:
        return "CSR Building Products Limited";
      case 0x04ba:
        return "Crestron Electronics, Inc.";
      case 0x04bb:
        return "Neatebox Ltd";
      case 0x04bc:
        return "Draegerwerk AG & Co. KGaA";
      case 0x04bd:
        return "AlbynMedical";
      case 0x04be:
        return "Averos FZCO";
      case 0x04bf:
        return "VIT Initiative, LLC";
      case 0x04c0:
        return "Statsports International";
      case 0x04c1:
        return "Sospitas, s.r.o.";
      case 0x04c2:
        return "Dmet Products Corp.";
      case 0x04c3:
        return "Mantracourt Electronics Limited";
      case 0x04c4:
        return "TeAM Hutchins AB";
      case 0x04c5:
        return "Seibert Williams Glass, LLC";
      case 0x04c6:
        return "Insta GmbH";
      case 0x04c7:
        return "Svantek Sp. z o.o.";
      case 0x04c8:
        return "Shanghai Flyco Electrical Appliance Co., Ltd.";
      case 0x04c9:
        return "Thornwave Labs Inc";
      case 0x04ca:
        return "Steiner-Optik GmbH";
      case 0x04cb:
        return "Novo Nordisk A/S";
      case 0x04cc:
        return "Enflux Inc.";
      case 0x04cd:
        return "Safetech Products LLC";
      case 0x04ce:
        return "GOOOLED S.R.L.";
      case 0x04cf:
        return "DOM Sicherheitstechnik GmbH & Co. KG";
      case 0x04d0:
        return "Olympus Corporation";
      case 0x04d1:
        return "KTS GmbH";
      case 0x04d2:
        return "Anloq Technologies Inc.";
      case 0x04d3:
        return "Queercon, Inc";
      case 0x04d4:
        return "5th Element Ltd";
      case 0x04d5:
        return "Gooee Limited";
      case 0x04d6:
        return "LUGLOC LLC";
      case 0x04d7:
        return "Blincam, Inc.";
      case 0x04d8:
        return "FUJIFILM Corporation";
      case 0x04d9:
        return "RM Acquisition LLC";
      case 0x04da:
        return "Franceschi Marina snc";
      case 0x04db:
        return "Engineered Audio, LLC.";
      case 0x04dc:
        return "IOTTIVE (OPC) PRIVATE LIMITED";
      case 0x04dd:
        return "4MOD Technology";
      case 0x04de:
        return "Lutron Electronics Co., Inc.";
      case 0x04df:
        return "Emerson Electric Co.";
      case 0x04e0:
        return "Guardtec, Inc.";
      case 0x04e1:
        return "REACTEC LIMITED";
      case 0x04e2:
        return "EllieGrid";
      case 0x04e3:
        return "Under Armour";
      case 0x04e4:
        return "Woodenshark";
      case 0x04e5:
        return "Avack Oy";
      case 0x04e6:
        return "Smart Solution Technology, Inc.";
      case 0x04e7:
        return "REHABTRONICS INC.";
      case 0x04e8:
        return "STABILO International";
      case 0x04e9:
        return "Busch Jaeger Elektro GmbH";
      case 0x04ea:
        return "Pacific Bioscience Laboratories, Inc";
      case 0x04eb:
        return "Bird Home Automation GmbH";
      case 0x04ec:
        return "Motorola Solutions";
      case 0x04ed:
        return "R9 Technology, Inc.";
      case 0x04ee:
        return "Auxivia";
      case 0x04ef:
        return "DaisyWorks, Inc";
      case 0x04f0:
        return "Kosi Limited";
      case 0x04f1:
        return "Theben AG";
      case 0x04f2:
        return "InDreamer Techsol Private Limited";
      case 0x04f3:
        return "Cerevast Medical";
      case 0x04f4:
        return "ZanCompute Inc.";
      case 0x04f5:
        return "Pirelli Tyre S.P.A.";
      case 0x04f6:
        return "McLear Limited";
      case 0x04f7:
        return "Shenzhen Goodix Technology Co., Ltd";
      case 0x04f8:
        return "Convergence Systems Limited";
      case 0x04f9:
        return "Interactio";
      case 0x04fa:
        return "Androtec GmbH";
      case 0x04fb:
        return "Benchmark Drives GmbH & Co. KG";
      case 0x04fc:
        return "SwingLync L. L. C.";
      case 0x04fd:
        return "Tapkey GmbH";
      case 0x04fe:
        return "Woosim Systems Inc.";
      case 0x04ff:
        return "Microsemi Corporation";
      case 0x0500:
        return "Wiliot LTD.";
      case 0x0501:
        return "Polaris IND";
      case 0x0502:
        return "Specifi-Kali LLC";
      case 0x0503:
        return "Locoroll, Inc";
      case 0x0504:
        return "PHYPLUS Inc";
      case 0x0505:
        return "InPlay, Inc.";
      case 0x0506:
        return "Hager";
      case 0x0507:
        return "Yellowcog";
      case 0x0508:
        return "Axes System sp. z o. o.";
      case 0x0509:
        return "Garage Smart, Inc.";
      case 0x050a:
        return "Shake-on B.V.";
      case 0x050b:
        return "Vibrissa Inc.";
      case 0x050c:
        return "OSRAM GmbH";
      case 0x050d:
        return "TRSystems GmbH";
      case 0x050e:
        return "Yichip Microelectronics (Hangzhou) Co.,Ltd.";
      case 0x050f:
        return "Foundation Engineering LLC";
      case 0x0510:
        return "UNI-ELECTRONICS, INC.";
      case 0x0511:
        return "Brookfield Equinox LLC";
      case 0x0512:
        return "Soprod SA";
      case 0x0513:
        return "9974091 Canada Inc.";
      case 0x0514:
        return "FIBRO GmbH";
      case 0x0515:
        return "RB Controls Co., Ltd.";
      case 0x0516:
        return "Footmarks";
      case 0x0517:
        return "Amtronic Sverige AB";
      case 0x0518:
        return "MAMORIO.inc";
      case 0x0519:
        return "Tyto Life LLC";
      case 0x051a:
        return "Leica Camera AG";
      case 0x051b:
        return "Angee Technologies Ltd.";
      case 0x051c:
        return "EDPS";
      case 0x051d:
        return "OFF Line Co., Ltd.";
      case 0x051e:
        return "Detect Blue Limited";
      case 0x051f:
        return "Setec Pty Ltd";
      case 0x0520:
        return "Target Corporation";
      case 0x0521:
        return "IAI Corporation";
      case 0x0522:
        return "NS Tech, Inc.";
      case 0x0523:
        return "MTG Co., Ltd.";
      case 0x0524:
        return "Hangzhou iMagic Technology Co., Ltd";
      case 0x0525:
        return "HONGKONG NANO IC TECHNOLOGIES  CO., LIMITED";
      case 0x0526:
        return "Honeywell International Inc.";
      case 0x0527:
        return "Albrecht JUNG";
      case 0x0528:
        return "Lunera Lighting Inc.";
      case 0x0529:
        return "Lumen UAB";
      case 0x052a:
        return "Keynes Controls Ltd";
      case 0x052b:
        return "Novartis AG";
      case 0x052c:
        return "Geosatis SA";
      case 0x052d:
        return "EXFO, Inc.";
      case 0x052e:
        return "LEDVANCE GmbH";
      case 0x052f:
        return "Center ID Corp.";
      case 0x0530:
        return "Adolene, Inc.";
      case 0x0531:
        return "D&M Holdings Inc.";
      case 0x0532:
        return "CRESCO Wireless, Inc.";
      case 0x0533:
        return "Nura Operations Pty Ltd";
      case 0x0534:
        return "Frontiergadget, Inc.";
      case 0x0535:
        return "Smart Component Technologies Limited";
      case 0x0536:
        return "ZTR Control Systems LLC";
      case 0x0537:
        return "MetaLogics Corporation";
      case 0x0538:
        return "Medela AG";
      case 0x0539:
        return "OPPLE Lighting Co., Ltd";
      case 0x053a:
        return "Savitech Corp.,";
      case 0x053b:
        return "prodigy";
      case 0x053c:
        return "Screenovate Technologies Ltd";
      case 0x053d:
        return "TESA SA";
      case 0x053e:
        return "CLIM8 LIMITED";
      case 0x053f:
        return "Silergy Corp";
      case 0x0540:
        return "SilverPlus, Inc";
      case 0x0541:
        return "Sharknet srl";
      case 0x0542:
        return "Mist Systems, Inc.";
      case 0x0543:
        return "MIWA LOCK CO.,Ltd";
      case 0x0544:
        return "OrthoSensor, Inc.";
      case 0x0545:
        return "Candy Hoover Group s.r.l";
      case 0x0546:
        return "Apexar Technologies S.A.";
      case 0x0547:
        return "LOGICDATA Electronic & Software Entwicklungs GmbH";
      case 0x0548:
        return "Knick Elektronische Messgeraete GmbH & Co. KG";
      case 0x0549:
        return "Smart Technologies and Investment Limited";
      case 0x054a:
        return "Linough Inc.";
      case 0x054b:
        return "Advanced Electronic Designs, Inc.";
      case 0x054c:
        return "Carefree Scott Fetzer Co Inc";
      case 0x054d:
        return "Sensome";
      case 0x054e:
        return "FORTRONIK storitve d.o.o.";
      case 0x054f:
        return "Sinnoz";
      case 0x0550:
        return "Versa Networks, Inc.";
      case 0x0551:
        return "Sylero";
      case 0x0552:
        return "Avempace SARL";
      case 0x0553:
        return "Nintendo Co., Ltd.";
      case 0x0554:
        return "National Instruments";
      case 0x0555:
        return "KROHNE Messtechnik GmbH";
      case 0x0556:
        return "Otodynamics Ltd";
      case 0x0557:
        return "Arwin Technology Limited";
      case 0x0558:
        return "benegear, inc.";
      case 0x0559:
        return "Newcon Optik";
      case 0x055a:
        return "CANDY HOUSE, Inc.";
      case 0x055b:
        return "FRANKLIN TECHNOLOGY INC";
      case 0x055c:
        return "Lely";
      case 0x055d:
        return "Valve Corporation";
      case 0x055e:
        return "Hekatron Vertriebs GmbH";
      case 0x055f:
        return "PROTECH S.A.S. DI GIRARDI ANDREA & C.";
      case 0x0560:
        return "Sarita CareTech APS";
      case 0x0561:
        return "Finder S.p.A.";
      case 0x0562:
        return "Thalmic Labs Inc.";
      case 0x0563:
        return "Steinel Vertrieb GmbH";
      case 0x0564:
        return "Beghelli Spa";
      case 0x0565:
        return "Beijing Smartspace Technologies Inc.";
      case 0x0566:
        return "CORE TRANSPORT TECHNOLOGIES NZ LIMITED";
      case 0x0567:
        return "Xiamen Everesports Goods Co., Ltd";
      case 0x0568:
        return "Bodyport Inc.";
      case 0x0569:
        return "Audionics System, INC.";
      case 0x056a:
        return "Flipnavi Co.,Ltd.";
      case 0x056b:
        return "Rion Co., Ltd.";
      case 0x056c:
        return "Long Range Systems, LLC";
      case 0x056d:
        return "Redmond Industrial Group LLC";
      case 0x056e:
        return "VIZPIN INC.";
      case 0x056f:
        return "BikeFinder AS";
      case 0x0570:
        return "Consumer Sleep Solutions LLC";
      case 0x0571:
        return "PSIKICK, INC.";
      case 0x0572:
        return "AntTail.com";
      case 0x0573:
        return "Lighting Science Group Corp.";
      case 0x0574:
        return "AFFORDABLE ELECTRONICS INC";
      case 0x0575:
        return "Integral Memroy Plc";
      case 0x0576:
        return "Globalstar, Inc.";
      case 0x0577:
        return "True Wearables, Inc.";
      case 0x0578:
        return "Wellington Drive Technologies Ltd";
      case 0x0579:
        return "Ensemble Tech Private Limited";
      case 0x057a:
        return "OMNI Remotes";
      case 0x057b:
        return "Duracell U.S. Operations Inc.";
      case 0x057c:
        return "Toor Technologies LLC";
      case 0x057d:
        return "Instinct Performance";
      case 0x057e:
        return "Beco, Inc";
      case 0x057f:
        return "Scuf Gaming International, LLC";
      case 0x0580:
        return "ARANZ Medical Limited";
      case 0x0581:
        return "LYS TECHNOLOGIES LTD";
      case 0x0582:
        return "Breakwall Analytics, LLC";
      case 0x0583:
        return "Code Blue Communications";
      case 0x0584:
        return "Gira Giersiepen GmbH & Co. KG";
      case 0x0585:
        return "Hearing Lab Technology";
      case 0x0586:
        return "LEGRAND";
      case 0x0587:
        return "Derichs GmbH";
      case 0x0588:
        return "ALT-TEKNIK LLC";
      case 0x0589:
        return "Star Technologies";
      case 0x058a:
        return "START TODAY CO.,LTD.";
      case 0x058b:
        return "Maxim Integrated Products";
      case 0x058c:
        return "Fracarro Radioindustrie SRL";
      case 0x058d:
        return "Jungheinrich Aktiengesellschaft";
      case 0x058e:
        return "Meta Platforms Technologies, LLC";
      case 0x058f:
        return "HENDON SEMICONDUCTORS PTY LTD";
      case 0x0590:
        return "Pur3 Ltd";
      case 0x0591:
        return "Viasat Group S.p.A.";
      case 0x0592:
        return "IZITHERM";
      case 0x0593:
        return "Spaulding Clinical Research";
      case 0x0594:
        return "Kohler Company";
      case 0x0595:
        return "Inor Process AB";
      case 0x0596:
        return "My Smart Blinds";
      case 0x0597:
        return "RadioPulse Inc";
      case 0x0598:
        return "rapitag GmbH";
      case 0x0599:
        return "Lazlo326, LLC.";
      case 0x059a:
        return "Teledyne Lecroy, Inc.";
      case 0x059b:
        return "Dataflow Systems Limited";
      case 0x059c:
        return "Macrogiga Electronics";
      case 0x059d:
        return "Tandem Diabetes Care";
      case 0x059e:
        return "Polycom, Inc.";
      case 0x059f:
        return "Fisher & Paykel Healthcare";
      case 0x05a0:
        return "RCP Software Oy";
      case 0x05a1:
        return "Shanghai Xiaoyi Technology Co.,Ltd.";
      case 0x05a2:
        return "ADHERIUM(NZ) LIMITED";
      case 0x05a3:
        return "Axiomware Systems Incorporated";
      case 0x05a4:
        return "O. E. M. Controls, Inc.";
      case 0x05a5:
        return "Kiiroo BV";
      case 0x05a6:
        return "Telecon Mobile Limited";
      case 0x05a7:
        return "Sonos Inc";
      case 0x05a8:
        return "Tom Allebrandi Consulting";
      case 0x05a9:
        return "Monidor";
      case 0x05aa:
        return "Tramex Limited";
      case 0x05ab:
        return "Nofence AS";
      case 0x05ac:
        return "GoerTek Dynaudio Co., Ltd.";
      case 0x05ad:
        return "INIA";
      case 0x05ae:
        return "CARMATE MFG.CO.,LTD";
      case 0x05af:
        return "OV LOOP, INC.";
      case 0x05b0:
        return "NewTec GmbH";
      case 0x05b1:
        return "Medallion Instrumentation Systems";
      case 0x05b2:
        return "CAREL INDUSTRIES S.P.A.";
      case 0x05b3:
        return "Parabit Systems, Inc.";
      case 0x05b4:
        return "White Horse Scientific ltd";
      case 0x05b5:
        return "verisilicon";
      case 0x05b6:
        return "Elecs Industry Co.,Ltd.";
      case 0x05b7:
        return "Beijing Pinecone Electronics Co.,Ltd.";
      case 0x05b8:
        return "Ambystoma Labs Inc.";
      case 0x05b9:
        return "Suzhou Pairlink Network Technology";
      case 0x05ba:
        return "igloohome";
      case 0x05bb:
        return "Oxford Metrics plc";
      case 0x05bc:
        return "Leviton Mfg. Co., Inc.";
      case 0x05bd:
        return "ULC Robotics Inc.";
      case 0x05be:
        return "RFID Global by Softwork SrL";
      case 0x05bf:
        return "Real-World-Systems Corporation";
      case 0x05c0:
        return "Nalu Medical, Inc.";
      case 0x05c1:
        return "P.I.Engineering";
      case 0x05c2:
        return "Grote Industries";
      case 0x05c3:
        return "Runtime, Inc.";
      case 0x05c4:
        return "Codecoup sp. z o.o. sp. k.";
      case 0x05c5:
        return "SELVE GmbH & Co. KG";
      case 0x05c6:
        return "Smart Animal Training Systems, LLC";
      case 0x05c7:
        return "Lippert Components, INC";
      case 0x05c8:
        return "SOMFY SAS";
      case 0x05c9:
        return "TBS Electronics B.V.";
      case 0x05ca:
        return "MHL Custom Inc";
      case 0x05cb:
        return "LucentWear LLC";
      case 0x05cc:
        return "WATTS ELECTRONICS";
      case 0x05cd:
        return "RJ Brands LLC";
      case 0x05ce:
        return "V-ZUG Ltd";
      case 0x05cf:
        return "Biowatch SA";
      case 0x05d0:
        return "Anova Applied Electronics";
      case 0x05d1:
        return "Lindab AB";
      case 0x05d2:
        return "frogblue TECHNOLOGY GmbH";
      case 0x05d3:
        return "Acurable Limited";
      case 0x05d4:
        return "LAMPLIGHT Co., Ltd.";
      case 0x05d5:
        return "TEGAM, Inc.";
      case 0x05d6:
        return "Zhuhai Jieli technology Co.,Ltd";
      case 0x05d7:
        return "modum.io AG";
      case 0x05d8:
        return "Farm Jenny LLC";
      case 0x05d9:
        return "Toyo Electronics Corporation";
      case 0x05da:
        return "Applied Neural Research Corp";
      case 0x05db:
        return "Avid Identification Systems, Inc.";
      case 0x05dc:
        return "Petronics Inc.";
      case 0x05dd:
        return "essentim GmbH";
      case 0x05de:
        return "QT Medical INC.";
      case 0x05df:
        return "VIRTUALCLINIC.DIRECT LIMITED";
      case 0x05e0:
        return "Viper Design LLC";
      case 0x05e1:
        return "Human, Incorporated";
      case 0x05e2:
        return "stAPPtronics GmbH";
      case 0x05e3:
        return "Elemental Machines, Inc.";
      case 0x05e4:
        return "Taiyo Yuden Co., Ltd";
      case 0x05e5:
        return "INEO ENERGY& SYSTEMS";
      case 0x05e6:
        return "Motion Instruments Inc.";
      case 0x05e7:
        return "PressurePro";
      case 0x05e8:
        return "COWBOY";
      case 0x05e9:
        return "iconmobile GmbH";
      case 0x05ea:
        return "ACS-Control-System GmbH";
      case 0x05eb:
        return "Bayerische Motoren Werke AG";
      case 0x05ec:
        return "Gycom Svenska AB";
      case 0x05ed:
        return "Fuji Xerox Co., Ltd";
      case 0x05ee:
        return "Wristcam Inc.";
      case 0x05ef:
        return "SIKOM AS";
      case 0x05f0:
        return "beken";
      case 0x05f1:
        return "The Linux Foundation";
      case 0x05f2:
        return "Try and E CO.,LTD.";
      case 0x05f3:
        return "SeeScan";
      case 0x05f4:
        return "Clearity, LLC";
      case 0x05f5:
        return "GS TAG";
      case 0x05f6:
        return "DPTechnics";
      case 0x05f7:
        return "TRACMO, INC.";
      case 0x05f8:
        return "Anki Inc.";
      case 0x05f9:
        return "Hagleitner Hygiene International GmbH";
      case 0x05fa:
        return "Konami Sports Life Co., Ltd.";
      case 0x05fb:
        return "Arblet Inc.";
      case 0x05fc:
        return "Masbando GmbH";
      case 0x05fd:
        return "Innoseis";
      case 0x05fe:
        return "Niko nv";
      case 0x05ff:
        return "Wellnomics Ltd";
      case 0x0600:
        return "iRobot Corporation";
      case 0x0601:
        return "Schrader Electronics";
      case 0x0602:
        return "Geberit International AG";
      case 0x0603:
        return "Fourth Evolution Inc";
      case 0x0604:
        return "Cell2Jack LLC";
      case 0x0605:
        return "FMW electronic Futterer u. Maier-Wolf OHG";
      case 0x0606:
        return "John Deere";
      case 0x0607:
        return "Rookery Technology Ltd";
      case 0x0608:
        return "KeySafe-Cloud";
      case 0x0609:
        return "BUCHI Labortechnik AG";
      case 0x060a:
        return "IQAir AG";
      case 0x060b:
        return "Triax Technologies Inc";
      case 0x060c:
        return "Vuzix Corporation";
      case 0x060d:
        return "TDK Corporation";
      case 0x060e:
        return "Blueair AB";
      case 0x060f:
        return "Signify Netherlands B.V.";
      case 0x0610:
        return "ADH GUARDIAN USA LLC";
      case 0x0611:
        return "Beurer GmbH";
      case 0x0612:
        return "Playfinity AS";
      case 0x0613:
        return "Hans Dinslage GmbH";
      case 0x0614:
        return "OnAsset Intelligence, Inc.";
      case 0x0615:
        return "INTER ACTION Corporation";
      case 0x0616:
        return "OS42 UG (haftungsbeschraenkt)";
      case 0x0617:
        return "WIZCONNECTED COMPANY LIMITED";
      case 0x0618:
        return "Audio-Technica Corporation";
      case 0x0619:
        return "Six Guys Labs, s.r.o.";
      case 0x061a:
        return "R.W. Beckett Corporation";
      case 0x061b:
        return "silex technology, inc.";
      case 0x061c:
        return "Univations Limited";
      case 0x061d:
        return "SENS Innovation ApS";
      case 0x061e:
        return "Diamond Kinetics, Inc.";
      case 0x061f:
        return "Phrame Inc.";
      case 0x0620:
        return "Forciot Oy";
      case 0x0621:
        return "Noordung d.o.o.";
      case 0x0622:
        return "Beam Labs, LLC";
      case 0x0623:
        return "Philadelphia Scientific (U.K.) Limited";
      case 0x0624:
        return "Biovotion AG";
      case 0x0625:
        return "Square Panda, Inc.";
      case 0x0626:
        return "Amplifico";
      case 0x0627:
        return "WEG S.A.";
      case 0x0628:
        return "Ensto Oy";
      case 0x0629:
        return "PHONEPE PVT LTD";
      case 0x062a:
        return "Lunatico Astronomia SL";
      case 0x062b:
        return "MinebeaMitsumi Inc.";
      case 0x062c:
        return "ASPion GmbH";
      case 0x062d:
        return "Vossloh-Schwabe Deutschland GmbH";
      case 0x062e:
        return "Procept";
      case 0x062f:
        return "ONKYO Corporation";
      case 0x0630:
        return "Asthrea D.O.O.";
      case 0x0631:
        return "Fortiori Design LLC";
      case 0x0632:
        return "Hugo Muller GmbH & Co KG";
      case 0x0633:
        return "Wangi Lai PLT";
      case 0x0634:
        return "Fanstel Corp";
      case 0x0635:
        return "Crookwood";
      case 0x0636:
        return "ELECTRONICA INTEGRAL DE SONIDO S.A.";
      case 0x0637:
        return "GiP Innovation Tools GmbH";
      case 0x0638:
        return "LX SOLUTIONS PTY LIMITED";
      case 0x0639:
        return "Shenzhen Minew Technologies Co., Ltd.";
      case 0x063a:
        return "Prolojik Limited";
      case 0x063b:
        return "Kromek Group Plc";
      case 0x063c:
        return "Contec Medical Systems Co., Ltd.";
      case 0x063d:
        return "Xradio Technology Co.,Ltd.";
      case 0x063e:
        return "The Indoor Lab, LLC";
      case 0x063f:
        return "LDL TECHNOLOGY";
      case 0x0640:
        return "Dish Network LLC";
      case 0x0641:
        return "Revenue Collection Systems FRANCE SAS";
      case 0x0642:
        return "Bluetrum Technology Co.,Ltd";
      case 0x0643:
        return "makita corporation";
      case 0x0644:
        return "Apogee Instruments";
      case 0x0645:
        return "BM3";
      case 0x0646:
        return "SGV Group Holding GmbH & Co. KG";
      case 0x0647:
        return "MED-EL";
      case 0x0648:
        return "Ultune Technologies";
      case 0x0649:
        return "Ryeex Technology Co.,Ltd.";
      case 0x064a:
        return "Open Research Institute, Inc.";
      case 0x064b:
        return "Scale-Tec, Ltd";
      case 0x064c:
        return "Zumtobel Group AG";
      case 0x064d:
        return "iLOQ Oy";
      case 0x064e:
        return "KRUXWorks Technologies Private Limited";
      case 0x064f:
        return "Digital Matter Pty Ltd";
      case 0x0650:
        return "Coravin, Inc.";
      case 0x0651:
        return "Stasis Labs, Inc.";
      case 0x0652:
        return "ITZ Innovations- und Technologiezentrum GmbH";
      case 0x0653:
        return "Meggitt SA";
      case 0x0654:
        return "Ledlenser GmbH & Co. KG";
      case 0x0655:
        return "Renishaw PLC";
      case 0x0656:
        return "ZhuHai AdvanPro Technology Company Limited";
      case 0x0657:
        return "Meshtronix Limited";
      case 0x0658:
        return "Payex Norge AS";
      case 0x0659:
        return "UnSeen Technologies Oy";
      case 0x065a:
        return "Zound Industries International AB";
      case 0x065b:
        return "Sesam Solutions BV";
      case 0x065c:
        return "PixArt Imaging Inc.";
      case 0x065d:
        return "Panduit Corp.";
      case 0x065e:
        return "Alo AB";
      case 0x065f:
        return "Ricoh Company Ltd";
      case 0x0660:
        return "RTC Industries, Inc.";
      case 0x0661:
        return "Mode Lighting Limited";
      case 0x0662:
        return "Particle Industries, Inc.";
      case 0x0663:
        return "Advanced Telemetry Systems, Inc.";
      case 0x0664:
        return "RHA TECHNOLOGIES LTD";
      case 0x0665:
        return "Pure International Limited";
      case 0x0666:
        return "WTO Werkzeug-Einrichtungen GmbH";
      case 0x0667:
        return "Spark Technology Labs Inc.";
      case 0x0668:
        return "Bleb Technology srl";
      case 0x0669:
        return "Livanova USA, Inc.";
      case 0x066a:
        return "Brady Worldwide Inc.";
      case 0x066b:
        return "DewertOkin GmbH";
      case 0x066c:
        return "Ztove ApS";
      case 0x066d:
        return "Venso EcoSolutions AB";
      case 0x066e:
        return "Eurotronik Kranj d.o.o.";
      case 0x066f:
        return "Hug Technology Ltd";
      case 0x0670:
        return "Gema Switzerland GmbH";
      case 0x0671:
        return "Buzz Products Ltd.";
      case 0x0672:
        return "Kopi";
      case 0x0673:
        return "Innova Ideas Limited";
      case 0x0674:
        return "BeSpoon";
      case 0x0675:
        return "Deco Enterprises, Inc.";
      case 0x0676:
        return "Expai Solutions Private Limited";
      case 0x0677:
        return "Innovation First, Inc.";
      case 0x0678:
        return "SABIK Offshore GmbH";
      case 0x0679:
        return "4iiii Innovations Inc.";
      case 0x067a:
        return "The Energy Conservatory, Inc.";
      case 0x067b:
        return "I.FARM, INC.";
      case 0x067c:
        return "Tile, Inc.";
      case 0x067d:
        return "Form Athletica Inc.";
      case 0x067e:
        return "MbientLab Inc";
      case 0x067f:
        return "NETGRID S.N.C. DI BISSOLI MATTEO, CAMPOREALE SIMONE, TOGNETTI FEDERICO";
      case 0x0680:
        return "Mannkind Corporation";
      case 0x0681:
        return "Trade FIDES a.s.";
      case 0x0682:
        return "Photron Limited";
      case 0x0683:
        return "Eltako GmbH";
      case 0x0684:
        return "Dermalapps, LLC";
      case 0x0685:
        return "Greenwald Industries";
      case 0x0686:
        return "inQs Co., Ltd.";
      case 0x0687:
        return "Cherry GmbH";
      case 0x0688:
        return "Amsted Digital Solutions Inc.";
      case 0x0689:
        return "Tacx b.v.";
      case 0x068a:
        return "Raytac Corporation";
      case 0x068b:
        return "Jiangsu Teranovo Tech Co., Ltd.";
      case 0x068c:
        return "Changzhou Sound Dragon Electronics and Acoustics Co., Ltd";
      case 0x068d:
        return "JetBeep Inc.";
      case 0x068e:
        return "Razer Inc.";
      case 0x068f:
        return "JRM Group Limited";
      case 0x0690:
        return "Eccrine Systems, Inc.";
      case 0x0691:
        return "Curie Point AB";
      case 0x0692:
        return "Georg Fischer AG";
      case 0x0693:
        return "Hach - Danaher";
      case 0x0694:
        return "T&A Laboratories LLC";
      case 0x0695:
        return "Koki Holdings Co., Ltd.";
      case 0x0696:
        return "Gunakar Private Limited";
      case 0x0697:
        return "Stemco Products Inc";
      case 0x0698:
        return "Wood IT Security, LLC";
      case 0x0699:
        return "RandomLab SAS";
      case 0x069a:
        return "Adero, Inc.";
      case 0x069b:
        return "Dragonchip Limited";
      case 0x069c:
        return "Noomi AB";
      case 0x069d:
        return "Vakaros LLC";
      case 0x069e:
        return "Delta Electronics, Inc.";
      case 0x069f:
        return "FlowMotion Technologies AS";
      case 0x06a0:
        return "OBIQ Location Technology Inc.";
      case 0x06a1:
        return "Cardo Systems, Ltd";
      case 0x06a2:
        return "Globalworx GmbH";
      case 0x06a3:
        return "Nymbus, LLC";
      case 0x06a4:
        return "LIMNO Co. Ltd.";
      case 0x06a5:
        return "TEKZITEL PTY LTD";
      case 0x06a6:
        return "Roambee Corporation";
      case 0x06a7:
        return "Chipsea Technologies (ShenZhen) Corp.";
      case 0x06a8:
        return "GD Midea Air-Conditioning Equipment Co., Ltd.";
      case 0x06a9:
        return "Soundmax Electronics Limited";
      case 0x06aa:
        return "Produal Oy";
      case 0x06ab:
        return "HMS Industrial Networks AB";
      case 0x06ac:
        return "Ingchips Technology Co., Ltd.";
      case 0x06ad:
        return "InnovaSea Systems Inc.";
      case 0x06ae:
        return "SenseQ Inc.";
      case 0x06af:
        return "Shoof Technologies";
      case 0x06b0:
        return "BRK Brands, Inc.";
      case 0x06b1:
        return "SimpliSafe, Inc.";
      case 0x06b2:
        return "Tussock Innovation 2013 Limited";
      case 0x06b3:
        return "The Hablab ApS";
      case 0x06b4:
        return "Sencilion Oy";
      case 0x06b5:
        return "Wabilogic Ltd.";
      case 0x06b6:
        return "Sociometric Solutions, Inc.";
      case 0x06b7:
        return "iCOGNIZE GmbH";
      case 0x06b8:
        return "ShadeCraft, Inc";
      case 0x06b9:
        return "Beflex Inc.";
      case 0x06ba:
        return "Beaconzone Ltd";
      case 0x06bb:
        return "Leaftronix Analogic Solutions Private Limited";
      case 0x06bc:
        return "TWS Srl";
      case 0x06bd:
        return "ABB Oy";
      case 0x06be:
        return "HitSeed Oy";
      case 0x06bf:
        return "Delcom Products Inc.";
      case 0x06c0:
        return "CAME S.p.A.";
      case 0x06c1:
        return "Alarm.com Holdings, Inc";
      case 0x06c2:
        return "Measurlogic Inc.";
      case 0x06c3:
        return "King I Electronics.Co.,Ltd";
      case 0x06c4:
        return "Dream Labs GmbH";
      case 0x06c5:
        return "Urban Compass, Inc";
      case 0x06c6:
        return "Simm Tronic Limited";
      case 0x06c7:
        return "Somatix Inc";
      case 0x06c8:
        return "Storz & Bickel GmbH & Co. KG";
      case 0x06c9:
        return "MYLAPS B.V.";
      case 0x06ca:
        return "Shenzhen Zhongguang Infotech Technology Development Co., Ltd";
      case 0x06cb:
        return "Dyeware, LLC";
      case 0x06cc:
        return "Dongguan SmartAction Technology Co.,Ltd.";
      case 0x06cd:
        return "DIG Corporation";
      case 0x06ce:
        return "FIOR & GENTZ";
      case 0x06cf:
        return "Belparts N.V.";
      case 0x06d0:
        return "Etekcity Corporation";
      case 0x06d1:
        return "Meyer Sound Laboratories, Incorporated";
      case 0x06d2:
        return "CeoTronics AG";
      case 0x06d3:
        return "TriTeq Lock and Security, LLC";
      case 0x06d4:
        return "DYNAKODE TECHNOLOGY PRIVATE LIMITED";
      case 0x06d5:
        return "Sensirion AG";
      case 0x06d6:
        return "JCT Healthcare Pty Ltd";
      case 0x06d7:
        return "FUBA Automotive Electronics GmbH";
      case 0x06d8:
        return "AW Company";
      case 0x06d9:
        return "Shanghai Mountain View Silicon Co.,Ltd.";
      case 0x06da:
        return "Zliide Technologies ApS";
      case 0x06db:
        return "Automatic Labs, Inc.";
      case 0x06dc:
        return "Industrial Network Controls, LLC";
      case 0x06dd:
        return "Intellithings Ltd.";
      case 0x06de:
        return "Navcast, Inc.";
      case 0x06df:
        return "HLI Solutions Inc.";
      case 0x06e0:
        return "Avaya Inc.";
      case 0x06e1:
        return "Milestone AV Technologies LLC";
      case 0x06e2:
        return "Alango Technologies Ltd";
      case 0x06e3:
        return "Spinlock Ltd";
      case 0x06e4:
        return "Aluna";
      case 0x06e5:
        return "OPTEX CO.,LTD.";
      case 0x06e6:
        return "NIHON DENGYO KOUSAKU";
      case 0x06e7:
        return "VELUX A/S";
      case 0x06e8:
        return "Almendo Technologies GmbH";
      case 0x06e9:
        return "Zmartfun Electronics, Inc.";
      case 0x06ea:
        return "SafeLine Sweden AB";
      case 0x06eb:
        return "Houston Radar LLC";
      case 0x06ec:
        return "Sigur";
      case 0x06ed:
        return "J Neades Ltd";
      case 0x06ee:
        return "Avantis Systems Limited";
      case 0x06ef:
        return "ALCARE Co., Ltd.";
      case 0x06f0:
        return "Chargy Technologies, SL";
      case 0x06f1:
        return "Shibutani Co., Ltd.";
      case 0x06f2:
        return "Trapper Data AB";
      case 0x06f3:
        return "Alfred International Inc.";
      case 0x06f4:
        return "Touché Technology Ltd";
      case 0x06f5:
        return "Vigil Technologies Inc.";
      case 0x06f6:
        return "Vitulo Plus BV";
      case 0x06f7:
        return "WILKA Schliesstechnik GmbH";
      case 0x06f8:
        return "BodyPlus Technology Co.,Ltd";
      case 0x06f9:
        return "happybrush GmbH";
      case 0x06fa:
        return "Enequi AB";
      case 0x06fb:
        return "Sartorius AG";
      case 0x06fc:
        return "Tom Communication Industrial Co.,Ltd.";
      case 0x06fd:
        return "ESS Embedded System Solutions Inc.";
      case 0x06fe:
        return "Mahr GmbH";
      case 0x06ff:
        return "Redpine Signals Inc";
      case 0x0700:
        return "TraqFreq LLC";
      case 0x0701:
        return "PAFERS TECH";
      case 0x0702:
        return 'Akciju sabiedriba "SAF TEHNIKA"';
      case 0x0703:
        return "Beijing Jingdong Century Trading Co., Ltd.";
      case 0x0704:
        return "JBX Designs Inc.";
      case 0x0705:
        return "AB Electrolux";
      case 0x0706:
        return "Wernher von Braun Center for ASdvanced Research";
      case 0x0707:
        return "Essity Hygiene and Health Aktiebolag";
      case 0x0708:
        return "Be Interactive Co., Ltd";
      case 0x0709:
        return "Carewear Corp.";
      case 0x070a:
        return "Huf Hülsbeck & Fürst GmbH & Co. KG";
      case 0x070b:
        return "Element Products, Inc.";
      case 0x070c:
        return "Beijing Winner Microelectronics Co.,Ltd";
      case 0x070d:
        return "SmartSnugg Pty Ltd";
      case 0x070e:
        return "FiveCo Sarl";
      case 0x070f:
        return "California Things Inc.";
      case 0x0710:
        return "Audiodo AB";
      case 0x0711:
        return "ABAX AS";
      case 0x0712:
        return "Bull Group Company Limited";
      case 0x0713:
        return "Respiri Limited";
      case 0x0714:
        return "MindPeace Safety LLC";
      case 0x0715:
        return "MBARC LABS Inc";
      case 0x0716:
        return "Altonics";
      case 0x0717:
        return "iQsquare BV";
      case 0x0718:
        return "IDIBAIX enginneering";
      case 0x0719:
        return "COREIOT PTY LTD";
      case 0x071a:
        return "REVSMART WEARABLE HK CO LTD";
      case 0x071b:
        return "Precor";
      case 0x071c:
        return "F5 Sports, Inc";
      case 0x071d:
        return "exoTIC Systems";
      case 0x071e:
        return "DONGGUAN HELE ELECTRONICS CO., LTD";
      case 0x071f:
        return "Dongguan Liesheng Electronic Co.Ltd";
      case 0x0720:
        return "Oculeve, Inc.";
      case 0x0721:
        return "Clover Network, Inc.";
      case 0x0722:
        return "Xiamen Eholder Electronics Co.Ltd";
      case 0x0723:
        return "Ford Motor Company";
      case 0x0724:
        return "Guangzhou SuperSound Information Technology Co.,Ltd";
      case 0x0725:
        return "Tedee Sp. z o.o.";
      case 0x0726:
        return "PHC Corporation";
      case 0x0727:
        return "STALKIT AS";
      case 0x0728:
        return "Eli Lilly and Company";
      case 0x0729:
        return "SwaraLink Technologies";
      case 0x072a:
        return "JMR embedded systems GmbH";
      case 0x072b:
        return "Bitkey Inc.";
      case 0x072c:
        return "GWA Hygiene GmbH";
      case 0x072d:
        return "Safera Oy";
      case 0x072e:
        return "Open Platform Systems LLC";
      case 0x072f:
        return "OnePlus Electronics (Shenzhen) Co., Ltd.";
      case 0x0730:
        return "Wildlife Acoustics, Inc.";
      case 0x0731:
        return "ABLIC Inc.";
      case 0x0732:
        return "Dairy Tech, LLC";
      case 0x0733:
        return "Iguanavation, Inc.";
      case 0x0734:
        return "DiUS Computing Pty Ltd";
      case 0x0735:
        return "UpRight Technologies LTD";
      case 0x0736:
        return "Luna XIO, Inc.";
      case 0x0737:
        return "LLC Navitek";
      case 0x0738:
        return "Glass Security Pte Ltd";
      case 0x0739:
        return "Jiangsu Qinheng Co., Ltd.";
      case 0x073a:
        return "Chandler Systems Inc.";
      case 0x073b:
        return "Fantini Cosmi s.p.a.";
      case 0x073c:
        return "Acubit ApS";
      case 0x073d:
        return "Beijing Hao Heng Tian Tech Co., Ltd.";
      case 0x073e:
        return "Bluepack S.R.L.";
      case 0x073f:
        return "Beijing Unisoc Technologies Co., Ltd.";
      case 0x0740:
        return "HITIQ LIMITED";
      case 0x0741:
        return "MAC SRL";
      case 0x0742:
        return "DML LLC";
      case 0x0743:
        return "Sanofi";
      case 0x0744:
        return "SOCOMEC";
      case 0x0745:
        return "WIZNOVA, Inc.";
      case 0x0746:
        return "Seitec Elektronik GmbH";
      case 0x0747:
        return "OR Technologies Pty Ltd";
      case 0x0748:
        return "GuangZhou KuGou Computer Technology Co.Ltd";
      case 0x0749:
        return "DIAODIAO (Beijing) Technology Co., Ltd.";
      case 0x074a:
        return "Illusory Studios LLC";
      case 0x074b:
        return "Sarvavid Software Solutions LLP";
      case 0x074c:
        return "iopool s.a.";
      case 0x074d:
        return "Amtech Systems, LLC";
      case 0x074e:
        return "EAGLE DETECTION SA";
      case 0x074f:
        return "MEDIATECH S.R.L.";
      case 0x0750:
        return "Hamilton Professional Services of Canada Incorporated";
      case 0x0751:
        return "Changsha JEMO IC Design Co.,Ltd";
      case 0x0752:
        return "Elatec GmbH";
      case 0x0753:
        return "JLG Industries, Inc.";
      case 0x0754:
        return "Michael Parkin";
      case 0x0755:
        return "Brother Industries, Ltd";
      case 0x0756:
        return "Lumens For Less, Inc";
      case 0x0757:
        return "ELA Innovation";
      case 0x0758:
        return "umanSense AB";
      case 0x0759:
        return "Shanghai InGeek Cyber Security Co., Ltd.";
      case 0x075a:
        return "HARMAN CO.,LTD.";
      case 0x075b:
        return "Smart Sensor Devices AB";
      case 0x075c:
        return "Antitronics Inc.";
      case 0x075d:
        return "RHOMBUS SYSTEMS, INC.";
      case 0x075e:
        return "Katerra Inc.";
      case 0x075f:
        return "Remote Solution Co., LTD.";
      case 0x0760:
        return "Vimar SpA";
      case 0x0761:
        return "Mantis Tech LLC";
      case 0x0762:
        return "TerOpta Ltd";
      case 0x0763:
        return "PIKOLIN S.L.";
      case 0x0764:
        return "WWZN Information Technology Company Limited";
      case 0x0765:
        return "Voxx International";
      case 0x0766:
        return "ART AND PROGRAM, INC.";
      case 0x0767:
        return "NITTO DENKO ASIA TECHNICAL CENTRE PTE. LTD.";
      case 0x0768:
        return "Peloton Interactive Inc.";
      case 0x0769:
        return "Force Impact Technologies";
      case 0x076a:
        return "Dmac Mobile Developments, LLC";
      case 0x076b:
        return "Engineered Medical Technologies";
      case 0x076c:
        return "Noodle Technology inc";
      case 0x076d:
        return "Graesslin GmbH";
      case 0x076e:
        return "WuQi technologies, Inc.";
      case 0x076f:
        return "Successful Endeavours Pty Ltd";
      case 0x0770:
        return "InnoCon Medical ApS";
      case 0x0771:
        return "Corvex Connected Safety";
      case 0x0772:
        return "Thirdwayv Inc.";
      case 0x0773:
        return "Echoflex Solutions Inc.";
      case 0x0774:
        return "C-MAX Asia Limited";
      case 0x0775:
        return "4eBusiness GmbH";
      case 0x0776:
        return "Cyber Transport Control GmbH";
      case 0x0777:
        return "Cue";
      case 0x0778:
        return "KOAMTAC INC.";
      case 0x0779:
        return "Loopshore Oy";
      case 0x077a:
        return "Niruha Systems Private Limited";
      case 0x077b:
        return "AmaterZ, Inc.";
      case 0x077c:
        return "radius co., ltd.";
      case 0x077d:
        return "Sensority, s.r.o.";
      case 0x077e:
        return "Sparkage Inc.";
      case 0x077f:
        return "Glenview Software Corporation";
      case 0x0780:
        return "Finch Technologies Ltd.";
      case 0x0781:
        return "Qingping Technology (Beijing) Co., Ltd.";
      case 0x0782:
        return "DeviceDrive AS";
      case 0x0783:
        return "ESEMBER LIMITED LIABILITY COMPANY";
      case 0x0784:
        return "audifon GmbH & Co. KG";
      case 0x0785:
        return "O2 Micro, Inc.";
      case 0x0786:
        return "HLP Controls Pty Limited";
      case 0x0787:
        return "Pangaea Solution";
      case 0x0788:
        return "BubblyNet, LLC";
      case 0x0789:
        return "PCB Piezotronics, Inc.";
      case 0x078a:
        return "The Wildflower Foundation";
      case 0x078b:
        return "Optikam Tech Inc.";
      case 0x078c:
        return "MINIBREW HOLDING B.V";
      case 0x078d:
        return "Cybex GmbH";
      case 0x078e:
        return "FUJIMIC NIIGATA, INC.";
      case 0x078f:
        return "Hanna Instruments, Inc.";
      case 0x0790:
        return "KOMPAN A/S";
      case 0x0791:
        return "Scosche Industries, Inc.";
      case 0x0792:
        return "Cricut, Inc.";
      case 0x0793:
        return "AEV spol. s r.o.";
      case 0x0794:
        return "The Coca-Cola Company";
      case 0x0795:
        return "GASTEC CORPORATION";
      case 0x0796:
        return "StarLeaf Ltd";
      case 0x0797:
        return "Water-i.d. GmbH";
      case 0x0798:
        return "HoloKit, Inc.";
      case 0x0799:
        return "PlantChoir Inc.";
      case 0x079a:
        return "GuangDong Oppo Mobile Telecommunications Corp., Ltd.";
      case 0x079b:
        return "CST ELECTRONICS (PROPRIETARY) LIMITED";
      case 0x079c:
        return "Sky UK Limited";
      case 0x079d:
        return "Digibale Pty Ltd";
      case 0x079e:
        return "Smartloxx GmbH";
      case 0x079f:
        return "Pune Scientific LLP";
      case 0x07a0:
        return "Regent Beleuchtungskorper AG";
      case 0x07a1:
        return "Apollo Neuroscience, Inc.";
      case 0x07a2:
        return "Roku, Inc.";
      case 0x07a3:
        return "Comcast Cable";
      case 0x07a4:
        return "Xiamen Mage Information Technology Co., Ltd.";
      case 0x07a5:
        return "RAB Lighting, Inc.";
      case 0x07a6:
        return "Musen Connect, Inc.";
      case 0x07a7:
        return "Zume, Inc.";
      case 0x07a8:
        return "conbee GmbH";
      case 0x07a9:
        return "Bruel & Kjaer Sound & Vibration";
      case 0x07aa:
        return "The Kroger Co.";
      case 0x07ab:
        return "Granite River Solutions, Inc.";
      case 0x07ac:
        return "LoupeDeck Oy";
      case 0x07ad:
        return "New H3C Technologies Co.,Ltd";
      case 0x07ae:
        return "Aurea Solucoes Tecnologicas Ltda.";
      case 0x07af:
        return "Hong Kong Bouffalo Lab Limited";
      case 0x07b0:
        return "GV Concepts Inc.";
      case 0x07b1:
        return "Thomas Dynamics, LLC";
      case 0x07b2:
        return "Moeco IOT Inc.";
      case 0x07b3:
        return "2N TELEKOMUNIKACE a.s.";
      case 0x07b4:
        return "Hormann KG Antriebstechnik";
      case 0x07b5:
        return "CRONO CHIP, S.L.";
      case 0x07b6:
        return "Soundbrenner Limited";
      case 0x07b7:
        return "ETABLISSEMENTS GEORGES RENAULT";
      case 0x07b8:
        return "iSwip";
      case 0x07b9:
        return "Epona Biotec Limited";
      case 0x07ba:
        return "Battery-Biz Inc.";
      case 0x07bb:
        return "EPIC S.R.L.";
      case 0x07bc:
        return "KD CIRCUITS LLC";
      case 0x07bd:
        return "Genedrive Diagnostics Ltd";
      case 0x07be:
        return "Axentia Technologies AB";
      case 0x07bf:
        return "REGULA Ltd.";
      case 0x07c0:
        return "Biral AG";
      case 0x07c1:
        return "A.W. Chesterton Company";
      case 0x07c2:
        return "Radinn AB";
      case 0x07c3:
        return "CIMTechniques, Inc.";
      case 0x07c4:
        return "Johnson Health Tech NA";
      case 0x07c5:
        return "June Life, Inc.";
      case 0x07c6:
        return "Bluenetics GmbH";
      case 0x07c7:
        return "iaconicDesign Inc.";
      case 0x07c8:
        return "WRLDS Creations AB";
      case 0x07c9:
        return "Skullcandy, Inc.";
      case 0x07ca:
        return "Modul-System HH AB";
      case 0x07cb:
        return "West Pharmaceutical Services, Inc.";
      case 0x07cc:
        return "Barnacle Systems Inc.";
      case 0x07cd:
        return "Smart Wave Technologies Canada Inc";
      case 0x07ce:
        return "Shanghai Top-Chip Microelectronics Tech. Co., LTD";
      case 0x07cf:
        return "NeoSensory, Inc.";
      case 0x07d0:
        return "Hangzhou Tuya Information  Technology Co., Ltd";
      case 0x07d1:
        return "Shanghai Panchip Microelectronics Co., Ltd";
      case 0x07d2:
        return "React Accessibility Limited";
      case 0x07d3:
        return "LIVNEX Co.,Ltd.";
      case 0x07d4:
        return "Kano Computing Limited";
      case 0x07d5:
        return "hoots classic GmbH";
      case 0x07d6:
        return "ecobee Inc.";
      case 0x07d7:
        return "Nanjing Qinheng Microelectronics Co., Ltd";
      case 0x07d8:
        return "SOLUTIONS AMBRA INC.";
      case 0x07d9:
        return "Micro-Design, Inc.";
      case 0x07da:
        return "STARLITE Co., Ltd.";
      case 0x07db:
        return "Remedee Labs";
      case 0x07dc:
        return "ThingOS GmbH & Co KG";
      case 0x07dd:
        return "Linear Circuits";
      case 0x07de:
        return "Unlimited Engineering SL";
      case 0x07df:
        return "Snap-on Incorporated";
      case 0x07e0:
        return "Edifier International Limited";
      case 0x07e1:
        return "Lucie Labs";
      case 0x07e2:
        return "Alfred Kaercher SE & Co. KG";
      case 0x07e3:
        return "Airoha Technology Corp.";
      case 0x07e4:
        return "Geeksme S.L.";
      case 0x07e5:
        return "Minut, Inc.";
      case 0x07e6:
        return "Waybeyond Limited";
      case 0x07e7:
        return "Komfort IQ, Inc.";
      case 0x07e8:
        return "Packetcraft, Inc.";
      case 0x07e9:
        return "Häfele GmbH & Co KG";
      case 0x07ea:
        return "ShapeLog, Inc.";
      case 0x07eb:
        return "NOVABASE S.R.L.";
      case 0x07ec:
        return "Frecce LLC";
      case 0x07ed:
        return "Joule IQ, INC.";
      case 0x07ee:
        return "KidzTek LLC";
      case 0x07ef:
        return "Aktiebolaget Sandvik Coromant";
      case 0x07f0:
        return "e-moola.com Pty Ltd";
      case 0x07f1:
        return "Zimi Innovations Pty Ltd";
      case 0x07f2:
        return "SERENE GROUP, INC";
      case 0x07f3:
        return "DIGISINE ENERGYTECH CO. LTD.";
      case 0x07f4:
        return "MEDIRLAB Orvosbiologiai Fejleszto Korlatolt Felelossegu Tarsasag";
      case 0x07f5:
        return "Byton North America Corporation";
      case 0x07f6:
        return "Shenzhen TonliScience and Technology Development Co.,Ltd";
      case 0x07f7:
        return "Cesar Systems Ltd.";
      case 0x07f8:
        return "quip NYC Inc.";
      case 0x07f9:
        return "Direct Communication Solutions, Inc.";
      case 0x07fa:
        return "Klipsch Group, Inc.";
      case 0x07fb:
        return "Access Co., Ltd";
      case 0x07fc:
        return "Renault SA";
      case 0x07fd:
        return "JSK CO., LTD.";
      case 0x07fe:
        return "BIROTA";
      case 0x07ff:
        return "maxon motor ltd.";
      case 0x0800:
        return "Optek";
      case 0x0801:
        return "CRONUS ELECTRONICS LTD";
      case 0x0802:
        return "NantSound, Inc.";
      case 0x0803:
        return "Domintell s.a.";
      case 0x0804:
        return "Andon Health Co.,Ltd";
      case 0x0805:
        return "Urbanminded Ltd";
      case 0x0806:
        return "TYRI Sweden AB";
      case 0x0807:
        return "ECD Electronic Components GmbH Dresden";
      case 0x0808:
        return "SISTEMAS KERN, SOCIEDAD ANÓMINA";
      case 0x0809:
        return "Trulli Audio";
      case 0x080a:
        return "Altaneos";
      case 0x080b:
        return "Nanoleaf Canada Limited";
      case 0x080c:
        return "Ingy B.V.";
      case 0x080d:
        return "Azbil Co.";
      case 0x080e:
        return "TATTCOM LLC";
      case 0x080f:
        return "Paradox Engineering SA";
      case 0x0810:
        return "LECO Corporation";
      case 0x0811:
        return "Becker Antriebe GmbH";
      case 0x0812:
        return "Mstream Technologies., Inc.";
      case 0x0813:
        return "Flextronics International USA Inc.";
      case 0x0814:
        return "Ossur hf.";
      case 0x0815:
        return "SKC Inc";
      case 0x0816:
        return "SPICA SYSTEMS LLC";
      case 0x0817:
        return "Wangs Alliance Corporation";
      case 0x0818:
        return "tatwah SA";
      case 0x0819:
        return "Hunter Douglas Inc";
      case 0x081a:
        return "Shenzhen Conex";
      case 0x081b:
        return "DIM3";
      case 0x081c:
        return "Bobrick Washroom Equipment, Inc.";
      case 0x081d:
        return "Potrykus Holdings and Development LLC";
      case 0x081e:
        return "iNFORM Technology GmbH";
      case 0x081f:
        return "eSenseLab LTD";
      case 0x0820:
        return "Brilliant Home Technology, Inc.";
      case 0x0821:
        return "INOVA Geophysical, Inc.";
      case 0x0822:
        return "adafruit industries";
      case 0x0823:
        return "Nexite Ltd";
      case 0x0824:
        return "8Power Limited";
      case 0x0825:
        return "CME PTE. LTD.";
      case 0x0826:
        return "Hyundai Motor Company";
      case 0x0827:
        return "Kickmaker";
      case 0x0828:
        return "Shanghai Suisheng Information Technology Co., Ltd.";
      case 0x0829:
        return "HEXAGON METROLOGY DIVISION ROMER";
      case 0x082a:
        return "Mitutoyo Corporation";
      case 0x082b:
        return "shenzhen fitcare electronics Co.,Ltd";
      case 0x082c:
        return "INGICS TECHNOLOGY CO., LTD.";
      case 0x082d:
        return "INCUS PERFORMANCE LTD.";
      case 0x082e:
        return "ABB S.p.A.";
      case 0x082f:
        return "Blippit AB";
      case 0x0830:
        return "Core Health and Fitness LLC";
      case 0x0831:
        return "Foxble, LLC";
      case 0x0832:
        return "Intermotive,Inc.";
      case 0x0833:
        return "Conneqtech B.V.";
      case 0x0834:
        return "RIKEN KEIKI CO., LTD.,";
      case 0x0835:
        return "Canopy Growth Corporation";
      case 0x0836:
        return "Bitwards Oy";
      case 0x0837:
        return "vivo Mobile Communication Co., Ltd.";
      case 0x0838:
        return "Etymotic Research, Inc.";
      case 0x0839:
        return "A puissance 3";
      case 0x083a:
        return "BPW Bergische Achsen Kommanditgesellschaft";
      case 0x083b:
        return "Piaggio Fast Forward";
      case 0x083c:
        return "BeerTech LTD";
      case 0x083d:
        return "Tokenize, Inc.";
      case 0x083e:
        return "Zorachka LTD";
      case 0x083f:
        return "D-Link Corp.";
      case 0x0840:
        return "Down Range Systems LLC";
      case 0x0841:
        return "General Luminaire (Shanghai) Co., Ltd.";
      case 0x0842:
        return "Tangshan HongJia electronic technology co., LTD.";
      case 0x0843:
        return "FRAGRANCE DELIVERY TECHNOLOGIES LTD";
      case 0x0844:
        return "Pepperl + Fuchs GmbH";
      case 0x0845:
        return "Dometic Corporation";
      case 0x0846:
        return "USound GmbH";
      case 0x0847:
        return "DNANUDGE LIMITED";
      case 0x0848:
        return "JUJU JOINTS CANADA CORP.";
      case 0x0849:
        return "Dopple Technologies B.V.";
      case 0x084a:
        return "ARCOM";
      case 0x084b:
        return "Biotechware SRL";
      case 0x084c:
        return "ORSO Inc.";
      case 0x084d:
        return "SafePort";
      case 0x084e:
        return "Carol Cole Company";
      case 0x084f:
        return "Embedded Fitness B.V.";
      case 0x0850:
        return "Yealink (Xiamen) Network Technology Co.,LTD";
      case 0x0851:
        return "Subeca, Inc.";
      case 0x0852:
        return "Cognosos, Inc.";
      case 0x0853:
        return "Pektron Group Limited";
      case 0x0854:
        return "Tap Sound System";
      case 0x0855:
        return "Helios Sports, Inc.";
      case 0x0856:
        return "Canopy Growth Corporation";
      case 0x0857:
        return "Parsyl Inc";
      case 0x0858:
        return "SOUNDBOKS";
      case 0x0859:
        return "BlueUp";
      case 0x085a:
        return "DAKATECH";
      case 0x085b:
        return "Nisshinbo Micro Devices Inc.";
      case 0x085c:
        return "ACOS CO.,LTD.";
      case 0x085d:
        return "Guilin Zhishen Information Technology Co.,Ltd.";
      case 0x085e:
        return "Krog Systems LLC";
      case 0x085f:
        return "COMPEGPS TEAM,SOCIEDAD LIMITADA";
      case 0x0860:
        return "Alflex Products B.V.";
      case 0x0861:
        return "SmartSensor Labs Ltd";
      case 0x0862:
        return "SmartDrive";
      case 0x0863:
        return "Yo-tronics Technology Co., Ltd.";
      case 0x0864:
        return "Rafaelmicro";
      case 0x0865:
        return "Emergency Lighting Products Limited";
      case 0x0866:
        return "LAONZ Co.,Ltd";
      case 0x0867:
        return "Western Digital Techologies, Inc.";
      case 0x0868:
        return "WIOsense GmbH & Co. KG";
      case 0x0869:
        return "EVVA Sicherheitstechnologie GmbH";
      case 0x086a:
        return "Odic Incorporated";
      case 0x086b:
        return "Pacific Track, LLC";
      case 0x086c:
        return "Revvo Technologies, Inc.";
      case 0x086d:
        return "Biometrika d.o.o.";
      case 0x086e:
        return "Vorwerk Elektrowerke GmbH & Co. KG";
      case 0x086f:
        return "Trackunit A/S";
      case 0x0870:
        return "Wyze Labs, Inc";
      case 0x0871:
        return "Dension Elektronikai Kft.";
      case 0x0872:
        return "11 Health & Technologies Limited";
      case 0x0873:
        return "Innophase Incorporated";
      case 0x0874:
        return "Treegreen Limited";
      case 0x0875:
        return "Berner International LLC";
      case 0x0876:
        return "SmartResQ ApS";
      case 0x0877:
        return "Tome, Inc.";
      case 0x0878:
        return "The Chamberlain Group, Inc.";
      case 0x0879:
        return "MIZUNO Corporation";
      case 0x087a:
        return "ZRF, LLC";
      case 0x087b:
        return "BYSTAMP";
      case 0x087c:
        return "Crosscan GmbH";
      case 0x087d:
        return "Konftel AB";
      case 0x087e:
        return "1bar.net Limited";
      case 0x087f:
        return "Phillips Connect Technologies LLC";
      case 0x0880:
        return "imagiLabs AB";
      case 0x0881:
        return "Optalert";
      case 0x0882:
        return "PSYONIC, Inc.";
      case 0x0883:
        return "Wintersteiger AG";
      case 0x0884:
        return "Controlid Industria, Comercio de Hardware e Servicos de Tecnologia Ltda";
      case 0x0885:
        return "LEVOLOR INC";
      case 0x0886:
        return "Movella Technologies B.V.";
      case 0x0887:
        return "Hydro-Gear Limited Partnership";
      case 0x0888:
        return "EnPointe Fencing Pty Ltd";
      case 0x0889:
        return "XANTHIO";
      case 0x088a:
        return "sclak s.r.l.";
      case 0x088b:
        return "Tricorder Arraay Technologies LLC";
      case 0x088c:
        return "GB Solution co.,Ltd";
      case 0x088d:
        return "Soliton Systems K.K.";
      case 0x088e:
        return "GIGA-TMS INC";
      case 0x088f:
        return "Tait International Limited";
      case 0x0890:
        return "NICHIEI INTEC CO., LTD.";
      case 0x0891:
        return "SmartWireless GmbH & Co. KG";
      case 0x0892:
        return "Ingenieurbuero Birnfeld UG (haftungsbeschraenkt)";
      case 0x0893:
        return "Maytronics Ltd";
      case 0x0894:
        return "EPIFIT";
      case 0x0895:
        return "Gimer medical";
      case 0x0896:
        return "Nokian Renkaat Oyj";
      case 0x0897:
        return "Current Lighting Solutions LLC";
      case 0x0898:
        return "Sensibo, Inc.";
      case 0x0899:
        return "SFS unimarket AG";
      case 0x089a:
        return 'Private limited company "Teltonika"';
      case 0x089b:
        return "Saucon Technologies";
      case 0x089c:
        return "Embedded Devices Co. Company";
      case 0x089d:
        return "J-J.A.D.E. Enterprise LLC";
      case 0x089e:
        return "i-SENS, inc.";
      case 0x089f:
        return "Witschi Electronic Ltd";
      case 0x08a0:
        return "Aclara Technologies LLC";
      case 0x08a1:
        return "EXEO TECH CORPORATION";
      case 0x08a2:
        return "Epic Systems Co., Ltd.";
      case 0x08a3:
        return "Hoffmann SE";
      case 0x08a4:
        return "Realme Chongqing Mobile Telecommunications Corp., Ltd.";
      case 0x08a5:
        return "UMEHEAL Ltd";
      case 0x08a6:
        return "Intelligenceworks Inc.";
      case 0x08a7:
        return "TGR 1.618 Limited";
      case 0x08a8:
        return "Shanghai Kfcube Inc";
      case 0x08a9:
        return "Fraunhofer IIS";
      case 0x08aa:
        return "SZ DJI TECHNOLOGY CO.,LTD";
      case 0x08ab:
        return "Coburn Technology, LLC";
      case 0x08ac:
        return "Topre Corporation";
      case 0x08ad:
        return "Kayamatics Limited";
      case 0x08ae:
        return "Moticon ReGo AG";
      case 0x08af:
        return "Polidea Sp. z o.o.";
      case 0x08b0:
        return "Trivedi Advanced Technologies LLC";
      case 0x08b1:
        return "CORE|vision BV";
      case 0x08b2:
        return "PF SCHWEISSTECHNOLOGIE GMBH";
      case 0x08b3:
        return "IONIQ Skincare GmbH & Co. KG";
      case 0x08b4:
        return "Sengled Co., Ltd.";
      case 0x08b5:
        return "TransferFi";
      case 0x08b6:
        return "Boehringer Ingelheim Vetmedica GmbH";
      case 0x08b7:
        return "ABB Inc";
      case 0x08b8:
        return "Check Technology Solutions LLC";
      case 0x08b9:
        return "U-Shin Ltd.";
      case 0x08ba:
        return "HYPER ICE, INC.";
      case 0x08bb:
        return "Tokai-rika co.,ltd.";
      case 0x08bc:
        return "Prevayl Limited";
      case 0x08bd:
        return "bf1systems limited";
      case 0x08be:
        return "ubisys technologies GmbH";
      case 0x08bf:
        return "SIRC Co., Ltd.";
      case 0x08c0:
        return "Accent Advanced Systems SLU";
      case 0x08c1:
        return "Rayden.Earth LTD";
      case 0x08c2:
        return "Lindinvent AB";
      case 0x08c3:
        return "CHIPOLO d.o.o.";
      case 0x08c4:
        return "CellAssist, LLC";
      case 0x08c5:
        return "J. Wagner GmbH";
      case 0x08c6:
        return "Integra Optics Inc";
      case 0x08c7:
        return "Monadnock Systems Ltd.";
      case 0x08c8:
        return "Liteboxer Technologies Inc.";
      case 0x08c9:
        return "Noventa AG";
      case 0x08ca:
        return "Nubia Technology Co.,Ltd.";
      case 0x08cb:
        return "JT INNOVATIONS LIMITED";
      case 0x08cc:
        return "TGM TECHNOLOGY CO., LTD.";
      case 0x08cd:
        return "ifly";
      case 0x08ce:
        return "ZIMI CORPORATION";
      case 0x08cf:
        return "betternotstealmybike UG (with limited liability)";
      case 0x08d0:
        return "ESTOM Infotech Kft.";
      case 0x08d1:
        return "Sensovium Inc.";
      case 0x08d2:
        return "Virscient Limited";
      case 0x08d3:
        return "Novel Bits, LLC";
      case 0x08d4:
        return "ADATA Technology Co., LTD.";
      case 0x08d5:
        return "KEYes";
      case 0x08d6:
        return "Nome Oy";
      case 0x08d7:
        return "Inovonics Corp";
      case 0x08d8:
        return "WARES";
      case 0x08d9:
        return "Pointr Labs Limited";
      case 0x08da:
        return "Miridia Technology Incorporated";
      case 0x08db:
        return "Tertium Technology";
      case 0x08dc:
        return "SHENZHEN AUKEY E BUSINESS CO., LTD";
      case 0x08dd:
        return "code-Q";
      case 0x08de:
        return "TE Connectivity Corporation";
      case 0x08df:
        return "IRIS OHYAMA CO.,LTD.";
      case 0x08e0:
        return "Philia Technology";
      case 0x08e1:
        return "KOZO KEIKAKU ENGINEERING Inc.";
      case 0x08e2:
        return "Shenzhen Simo Technology co. LTD";
      case 0x08e3:
        return "Republic Wireless, Inc.";
      case 0x08e4:
        return "Rashidov ltd";
      case 0x08e5:
        return "Crowd Connected Ltd";
      case 0x08e6:
        return "Eneso Tecnologia de Adaptacion S.L.";
      case 0x08e7:
        return "Barrot Technology Co.,Ltd.";
      case 0x08e8:
        return "Naonext";
      case 0x08e9:
        return "Taiwan Intelligent Home Corp.";
      case 0x08ea:
        return "COWBELL ENGINEERING CO.,LTD.";
      case 0x08eb:
        return "Beijing Big Moment Technology Co., Ltd.";
      case 0x08ec:
        return "Denso Corporation";
      case 0x08ed:
        return "IMI Hydronic Engineering International SA";
      case 0x08ee:
        return "Askey Computer Corp.";
      case 0x08ef:
        return "Cumulus Digital Systems, Inc";
      case 0x08f0:
        return "Joovv, Inc.";
      case 0x08f1:
        return "The L.S. Starrett Company";
      case 0x08f2:
        return "Microoled";
      case 0x08f3:
        return "PSP - Pauli Services & Products GmbH";
      case 0x08f4:
        return "Kodimo Technologies Company Limited";
      case 0x08f5:
        return "Tymtix Technologies Private Limited";
      case 0x08f6:
        return "Dermal Photonics Corporation";
      case 0x08f7:
        return "MTD Products Inc & Affiliates";
      case 0x08f8:
        return "instagrid GmbH";
      case 0x08f9:
        return "Spacelabs Medical Inc.";
      case 0x08fa:
        return "Troo Corporation";
      case 0x08fb:
        return "Darkglass Electronics Oy";
      case 0x08fc:
        return "Hill-Rom";
      case 0x08fd:
        return "BioIntelliSense, Inc.";
      case 0x08fe:
        return "Ketronixs Sdn Bhd";
      case 0x08ff:
        return "Plastimold Products, Inc";
      case 0x0900:
        return "Beijing Zizai Technology Co., LTD.";
      case 0x0901:
        return "Lucimed";
      case 0x0902:
        return "TSC Auto-ID Technology Co., Ltd.";
      case 0x0903:
        return "DATAMARS, Inc.";
      case 0x0904:
        return "SUNCORPORATION";
      case 0x0905:
        return "Yandex Services AG";
      case 0x0906:
        return "Scope Logistical Solutions";
      case 0x0907:
        return "User Hello, LLC";
      case 0x0908:
        return "Pinpoint Innovations Limited";
      case 0x0909:
        return "70mai Co.,Ltd.";
      case 0x090a:
        return "Zhuhai Hoksi Technology CO.,LTD";
      case 0x090b:
        return "EMBR labs, INC";
      case 0x090c:
        return "Radiawave Technologies Co.,Ltd.";
      case 0x090d:
        return "IOT Invent GmbH";
      case 0x090e:
        return "OPTIMUSIOT TECH LLP";
      case 0x090f:
        return "VC Inc.";
      case 0x0910:
        return "ASR Microelectronics (Shanghai) Co., Ltd.";
      case 0x0911:
        return "Douglas Lighting Controls Inc.";
      case 0x0912:
        return "Nerbio Medical Software Platforms Inc";
      case 0x0913:
        return "Braveheart Wireless, Inc.";
      case 0x0914:
        return "INEO-SENSE";
      case 0x0915:
        return "Honda Motor Co., Ltd.";
      case 0x0916:
        return "Ambient Sensors LLC";
      case 0x0917:
        return "ASR Microelectronics(ShenZhen)Co., Ltd.";
      case 0x0918:
        return "Technosphere Labs Pvt. Ltd.";
      case 0x0919:
        return "NO SMD LIMITED";
      case 0x091a:
        return "Albertronic BV";
      case 0x091b:
        return "Luminostics, Inc.";
      case 0x091c:
        return "Oblamatik AG";
      case 0x091d:
        return "Innokind, Inc.";
      case 0x091e:
        return "Melbot Studios, Sociedad Limitada";
      case 0x091f:
        return "Myzee Technology";
      case 0x0920:
        return "Omnisense Limited";
      case 0x0921:
        return "KAHA PTE. LTD.";
      case 0x0922:
        return "Shanghai MXCHIP Information Technology Co., Ltd.";
      case 0x0923:
        return "JSB TECH PTE LTD";
      case 0x0924:
        return "Fundacion Tecnalia Research and Innovation";
      case 0x0925:
        return "Yukai Engineering Inc.";
      case 0x0926:
        return "Gooligum Technologies Pty Ltd";
      case 0x0927:
        return "ROOQ GmbH";
      case 0x0928:
        return "AiRISTA";
      case 0x0929:
        return "Qingdao Haier Technology Co., Ltd.";
      case 0x092a:
        return "Sappl Verwaltungs- und Betriebs GmbH";
      case 0x092b:
        return "TekHome";
      case 0x092c:
        return "PCI Private Limited";
      case 0x092d:
        return "Leggett & Platt, Incorporated";
      case 0x092e:
        return "PS GmbH";
      case 0x092f:
        return "C.O.B.O. SpA";
      case 0x0930:
        return "James Walker RotaBolt Limited";
      case 0x0931:
        return "BREATHINGS Co., Ltd.";
      case 0x0932:
        return "BarVision, LLC";
      case 0x0933:
        return "SRAM";
      case 0x0934:
        return "KiteSpring Inc.";
      case 0x0935:
        return "Reconnect, Inc.";
      case 0x0936:
        return "Elekon AG";
      case 0x0937:
        return "RealThingks GmbH";
      case 0x0938:
        return "Henway Technologies, LTD.";
      case 0x0939:
        return "ASTEM Co.,Ltd.";
      case 0x093a:
        return "LinkedSemi Microelectronics (Xiamen) Co., Ltd";
      case 0x093b:
        return "ENSESO LLC";
      case 0x093c:
        return "Xenoma Inc.";
      case 0x093d:
        return "Adolf Wuerth GmbH & Co KG";
      case 0x093e:
        return "Catalyft Labs, Inc.";
      case 0x093f:
        return "JEPICO Corporation";
      case 0x0940:
        return "Hero Workout GmbH";
      case 0x0941:
        return "Rivian Automotive, LLC";
      case 0x0942:
        return "TRANSSION HOLDINGS LIMITED";
      case 0x0943:
        return "Reserved";
      case 0x0944:
        return "Agitron d.o.o.";
      case 0x0945:
        return "Globe (Jiangsu) Co., Ltd";
      case 0x0946:
        return "AMC International Alfa Metalcraft Corporation AG";
      case 0x0947:
        return "First Light Technologies Ltd.";
      case 0x0948:
        return "Wearable Link Limited";
      case 0x0949:
        return "Metronom Health Europe";
      case 0x094a:
        return "Zwift, Inc.";
      case 0x094b:
        return "Kindeva Drug Delivery L.P.";
      case 0x094c:
        return "GimmiSys GmbH";
      case 0x094d:
        return "tkLABS INC.";
      case 0x094e:
        return "PassiveBolt, Inc.";
      case 0x094f:
        return 'Limited Liability Company "Mikrotikls"';
      case 0x0950:
        return "Capetech";
      case 0x0951:
        return "PPRS";
      case 0x0952:
        return "Apptricity Corporation";
      case 0x0953:
        return "LogiLube, LLC";
      case 0x0954:
        return "Julbo";
      case 0x0955:
        return "Breville Group";
      case 0x0956:
        return "Kerlink";
      case 0x0957:
        return "Ohsung Electronics";
      case 0x0958:
        return "ZTE Corporation";
      case 0x0959:
        return "HerdDogg, Inc";
      case 0x095a:
        return "Selekt Bilgisayar, lletisim Urunleri lnsaat Sanayi ve Ticaret Limited Sirketi";
      case 0x095b:
        return "Lismore Instruments Limited";
      case 0x095c:
        return "LogiLube, LLC";
      case 0x095d:
        return "Electronic Theatre Controls";
      case 0x095e:
        return "BioEchoNet inc.";
      case 0x095f:
        return "NUANCE HEARING LTD";
      case 0x0960:
        return "Sena Technologies Inc.";
      case 0x0961:
        return "Linkura AB";
      case 0x0962:
        return "GL Solutions K.K.";
      case 0x0963:
        return "Moonbird BV";
      case 0x0964:
        return "Countrymate Technology Limited";
      case 0x0965:
        return "Asahi Kasei Corporation";
      case 0x0966:
        return "PointGuard, LLC";
      case 0x0967:
        return "Neo Materials and Consulting Inc.";
      case 0x0968:
        return "Actev Motors, Inc.";
      case 0x0969:
        return "Woan Technology (Shenzhen) Co., Ltd.";
      case 0x096a:
        return "dricos, Inc.";
      case 0x096b:
        return "Guide ID B.V.";
      case 0x096c:
        return "9374-7319 Quebec inc";
      case 0x096d:
        return "Gunwerks, LLC";
      case 0x096e:
        return "Band Industries, inc.";
      case 0x096f:
        return "Lund Motion Products, Inc.";
      case 0x0970:
        return "IBA Dosimetry GmbH";
      case 0x0971:
        return "GA";
      case 0x0972:
        return 'Closed Joint Stock Company "Zavod Flometr" ("Zavod Flometr" CJSC)';
      case 0x0973:
        return "Popit Oy";
      case 0x0974:
        return "ABEYE";
      case 0x0975:
        return "BlueIOT(Beijing) Technology Co.,Ltd";
      case 0x0976:
        return "Fauna Audio GmbH";
      case 0x0977:
        return "TOYOTA motor corporation";
      case 0x0978:
        return "ZifferEins GmbH & Co. KG";
      case 0x0979:
        return "BIOTRONIK SE & Co. KG";
      case 0x097a:
        return "CORE CORPORATION";
      case 0x097b:
        return "CTEK Sweden AB";
      case 0x097c:
        return "Thorley Industries, LLC";
      case 0x097d:
        return "CLB B.V.";
      case 0x097e:
        return "SonicSensory Inc";
      case 0x097f:
        return "ISEMAR S.R.L.";
      case 0x0980:
        return "DEKRA TESTING AND CERTIFICATION, S.A.U.";
      case 0x0981:
        return "Bernard Krone Holding SE & Co.KG";
      case 0x0982:
        return "ELPRO-BUCHS AG";
      case 0x0983:
        return "Feedback Sports LLC";
      case 0x0984:
        return "TeraTron GmbH";
      case 0x0985:
        return "Lumos Health Inc.";
      case 0x0986:
        return "Cello Hill, LLC";
      case 0x0987:
        return "TSE BRAKES, INC.";
      case 0x0988:
        return "BHM-Tech Produktionsgesellschaft m.b.H";
      case 0x0989:
        return "WIKA Alexander Wiegand SE & Co.KG";
      case 0x098a:
        return "Biovigil";
      case 0x098b:
        return "Mequonic Engineering, S.L.";
      case 0x098c:
        return "bGrid B.V.";
      case 0x098d:
        return "C3-WIRELESS, LLC";
      case 0x098e:
        return "ADVEEZ";
      case 0x098f:
        return "Aktiebolaget Regin";
      case 0x0990:
        return "Anton Paar GmbH";
      case 0x0991:
        return "Telenor ASA";
      case 0x0992:
        return "Big Kaiser Precision Tooling Ltd";
      case 0x0993:
        return "Absolute Audio Labs B.V.";
      case 0x0994:
        return "VT42 Pty Ltd";
      case 0x0995:
        return "Bronkhorst High-Tech B.V.";
      case 0x0996:
        return "C. & E. Fein GmbH";
      case 0x0997:
        return "NextMind";
      case 0x0998:
        return "Pixie Dust Technologies, Inc.";
      case 0x0999:
        return "eTactica ehf";
      case 0x099a:
        return "New Audio LLC";
      case 0x099b:
        return "Sendum Wireless Corporation";
      case 0x099c:
        return "deister electronic GmbH";
      case 0x099d:
        return "YKK AP Inc.";
      case 0x099e:
        return "Step One Limited";
      case 0x099f:
        return "Koya Medical, Inc.";
      case 0x09a0:
        return "Proof Diagnostics, Inc.";
      case 0x09a1:
        return "VOS Systems, LLC";
      case 0x09a2:
        return "ENGAGENOW DATA SCIENCES PRIVATE LIMITED";
      case 0x09a3:
        return "ARDUINO SA";
      case 0x09a4:
        return "KUMHO ELECTRICS, INC";
      case 0x09a5:
        return "Security Enhancement Systems, LLC";
      case 0x09a6:
        return "BEIJING ELECTRIC VEHICLE CO.,LTD";
      case 0x09a7:
        return "Paybuddy ApS";
      case 0x09a8:
        return "KHN Solutions LLC";
      case 0x09a9:
        return "Nippon Ceramic Co.,Ltd.";
      case 0x09aa:
        return "PHOTODYNAMIC INCORPORATED";
      case 0x09ab:
        return "DashLogic, Inc.";
      case 0x09ac:
        return "Ambiq";
      case 0x09ad:
        return "Narhwall Inc.";
      case 0x09ae:
        return "Pozyx NV";
      case 0x09af:
        return "ifLink Open Community";
      case 0x09b0:
        return "Deublin Company, LLC";
      case 0x09b1:
        return "BLINQY";
      case 0x09b2:
        return "DYPHI";
      case 0x09b3:
        return "BlueX Microelectronics Corp Ltd.";
      case 0x09b4:
        return "PentaLock Aps.";
      case 0x09b5:
        return "AUTEC Gesellschaft fuer Automationstechnik mbH";
      case 0x09b6:
        return "Pegasus Technologies, Inc.";
      case 0x09b7:
        return "Bout Labs, LLC";
      case 0x09b8:
        return "PlayerData Limited";
      case 0x09b9:
        return "SAVOY ELECTRONIC LIGHTING";
      case 0x09ba:
        return "Elimo Engineering Ltd";
      case 0x09bb:
        return "SkyStream Corporation";
      case 0x09bc:
        return "Aerosens LLC";
      case 0x09bd:
        return "Centre Suisse d'Electronique et de Microtechnique SA";
      case 0x09be:
        return "Vessel Ltd.";
      case 0x09bf:
        return "Span.IO, Inc.";
      case 0x09c0:
        return "AnotherBrain inc.";
      case 0x09c1:
        return "Rosewill";
      case 0x09c2:
        return "Universal Audio, Inc.";
      case 0x09c3:
        return "JAPAN TOBACCO INC.";
      case 0x09c4:
        return "UVISIO";
      case 0x09c5:
        return "HungYi Microelectronics Co.,Ltd.";
      case 0x09c6:
        return "Honor Device Co., Ltd.";
      case 0x09c7:
        return "Combustion, LLC";
      case 0x09c8:
        return "XUNTONG";
      case 0x09c9:
        return "CrowdGlow Ltd";
      case 0x09ca:
        return "Mobitrace";
      case 0x09cb:
        return "Hx Engineering, LLC";
      case 0x09cc:
        return "Senso4s d.o.o.";
      case 0x09cd:
        return "Blyott";
      case 0x09ce:
        return "Julius Blum GmbH";
      case 0x09cf:
        return "BlueStreak IoT, LLC";
      case 0x09d0:
        return "Chess Wise B.V.";
      case 0x09d1:
        return "ABLEPAY TECHNOLOGIES AS";
      case 0x09d2:
        return "Temperature Sensitive Solutions Systems Sweden AB";
      case 0x09d3:
        return "HeartHero, inc.";
      case 0x09d4:
        return "ORBIS Inc.";
      case 0x09d5:
        return "GEAR RADIO ELECTRONICS CORP.";
      case 0x09d6:
        return "EAR TEKNIK ISITME VE ODIOMETRI CIHAZLARI SANAYI VE TICARET ANONIM SIRKETI";
      case 0x09d7:
        return "Coyotta";
      case 0x09d8:
        return "Synergy Tecnologia em Sistemas Ltda";
      case 0x09d9:
        return "VivoSensMedical GmbH";
      case 0x09da:
        return "Nagravision SA";
      case 0x09db:
        return "Bionic Avionics Inc.";
      case 0x09dc:
        return "AON2 Ltd.";
      case 0x09dd:
        return "Innoware Development AB";
      case 0x09de:
        return "JLD Technology Solutions, LLC";
      case 0x09df:
        return "Magnus Technology Sdn Bhd";
      case 0x09e0:
        return "Preddio Technologies Inc.";
      case 0x09e1:
        return "Tag-N-Trac Inc";
      case 0x09e2:
        return "Wuhan Linptech Co.,Ltd.";
      case 0x09e3:
        return "Friday Home Aps";
      case 0x09e4:
        return "CPS AS";
      case 0x09e5:
        return "Mobilogix";
      case 0x09e6:
        return "Masonite Corporation";
      case 0x09e7:
        return "Kabushikigaisha HANERON";
      case 0x09e8:
        return "Melange Systems Pvt. Ltd.";
      case 0x09e9:
        return "LumenRadio AB";
      case 0x09ea:
        return "Athlos Oy";
      case 0x09eb:
        return "KEAN ELECTRONICS PTY LTD";
      case 0x09ec:
        return "Yukon advanced optics worldwide, UAB";
      case 0x09ed:
        return "Sibel Inc.";
      case 0x09ee:
        return "OJMAR SA";
      case 0x09ef:
        return "Steinel Solutions AG";
      case 0x09f0:
        return "WatchGas B.V.";
      case 0x09f1:
        return "OM Digital Solutions Corporation";
      case 0x09f2:
        return "Audeara Pty Ltd";
      case 0x09f3:
        return "Beijing Zero Zero Infinity Technology Co.,Ltd.";
      case 0x09f4:
        return "Spectrum Technologies, Inc.";
      case 0x09f5:
        return "OKI Electric Industry Co., Ltd";
      case 0x09f6:
        return "Mobile Action Technology Inc.";
      case 0x09f7:
        return "SENSATEC Co., Ltd.";
      case 0x09f8:
        return "R.O. S.R.L.";
      case 0x09f9:
        return "Hangzhou Yaguan Technology Co. LTD";
      case 0x09fa:
        return "Listen Technologies Corporation";
      case 0x09fb:
        return "TOITU CO., LTD.";
      case 0x09fc:
        return "Confidex";
      case 0x09fd:
        return "Keep Technologies, Inc.";
      case 0x09fe:
        return "Lichtvision Engineering GmbH";
      case 0x09ff:
        return "AIRSTAR";
      case 0x0a00:
        return "Ampler Bikes OU";
      case 0x0a01:
        return "Cleveron AS";
      case 0x0a02:
        return "Ayxon-Dynamics GmbH";
      case 0x0a03:
        return "donutrobotics Co., Ltd.";
      case 0x0a04:
        return "Flosonics Medical";
      case 0x0a05:
        return "Southwire Company, LLC";
      case 0x0a06:
        return "Shanghai wuqi microelectronics Co.,Ltd";
      case 0x0a07:
        return "Reflow Pty Ltd";
      case 0x0a08:
        return "Oras Oy";
      case 0x0a09:
        return "ECCT";
      case 0x0a0a:
        return "Volan Technology Inc.";
      case 0x0a0b:
        return "SIANA Systems";
      case 0x0a0c:
        return "Shanghai Yidian Intelligent Technology Co., Ltd.";
      case 0x0a0d:
        return "Blue Peacock GmbH";
      case 0x0a0e:
        return "Roland Corporation";
      case 0x0a0f:
        return "LIXIL Corporation";
      case 0x0a10:
        return "SUBARU Corporation";
      case 0x0a11:
        return "Sensolus";
      case 0x0a12:
        return "Dyson Technology Limited";
      case 0x0a13:
        return "Tec4med LifeScience GmbH";
      case 0x0a14:
        return "CROXEL, INC.";
      case 0x0a15:
        return "Syng Inc";
      case 0x0a16:
        return "RIDE VISION LTD";
      case 0x0a17:
        return "Plume Design Inc";
      case 0x0a18:
        return "Cambridge Animal Technologies Ltd";
      case 0x0a19:
        return "Maxell, Ltd.";
      case 0x0a1a:
        return "Link Labs, Inc.";
      case 0x0a1b:
        return "Embrava Pty Ltd";
      case 0x0a1c:
        return "INPEAK S.C.";
      case 0x0a1d:
        return "API-K";
      case 0x0a1e:
        return "CombiQ AB";
      case 0x0a1f:
        return "DeVilbiss Healthcare LLC";
      case 0x0a20:
        return "Jiangxi Innotech Technology Co., Ltd";
      case 0x0a21:
        return "Apollogic Sp. z o.o.";
      case 0x0a22:
        return "DAIICHIKOSHO CO., LTD.";
      case 0x0a23:
        return "BIXOLON CO.,LTD";
      case 0x0a24:
        return "Atmosic Technologies, Inc.";
      case 0x0a25:
        return "Eran Financial Services LLC";
      case 0x0a26:
        return "Louis Vuitton";
      case 0x0a27:
        return "AYU DEVICES PRIVATE LIMITED";
      case 0x0a28:
        return "NanoFlex Power Corporation";
      case 0x0a29:
        return "Worthcloud Technology Co.,Ltd";
      case 0x0a2a:
        return "Yamaha Corporation";
      case 0x0a2b:
        return "PaceBait IVS";
      case 0x0a2c:
        return "Shenzhen H&T Intelligent Control Co., Ltd";
      case 0x0a2d:
        return "Shenzhen Feasycom Technology Co., Ltd.";
      case 0x0a2e:
        return "Zuma Array Limited";
      case 0x0a2f:
        return "Instamic, Inc.";
      case 0x0a30:
        return "Air-Weigh";
      case 0x0a31:
        return "Nevro Corp.";
      case 0x0a32:
        return "Pinnacle Technology, Inc.";
      case 0x0a33:
        return "WMF AG";
      case 0x0a34:
        return "Luxer Corporation";
      case 0x0a35:
        return "safectory GmbH";
      case 0x0a36:
        return "NGK SPARK PLUG CO., LTD.";
      case 0x0a37:
        return "2587702 Ontario Inc.";
      case 0x0a38:
        return "Bouffalo Lab (Nanjing)., Ltd.";
      case 0x0a39:
        return "BLUETICKETING SRL";
      case 0x0a3a:
        return "Incotex Co. Ltd.";
      case 0x0a3b:
        return "Galileo Technology Limited";
      case 0x0a3c:
        return "Siteco GmbH";
      case 0x0a3d:
        return "DELABIE";
      case 0x0a3e:
        return "Hefei Yunlian Semiconductor Co., Ltd";
      case 0x0a3f:
        return "Shenzhen Yopeak Optoelectronics Technology Co., Ltd.";
      case 0x0a40:
        return "GEWISS S.p.A.";
      case 0x0a41:
        return "OPEX Corporation";
      case 0x0a42:
        return "Motionalysis, Inc.";
      case 0x0a43:
        return "Busch Systems International Inc.";
      case 0x0a44:
        return "Novidan, Inc.";
      case 0x0a45:
        return "3SI Security Systems, Inc";
      case 0x0a46:
        return "Beijing HC-Infinite Technology Limited";
      case 0x0a47:
        return "The Wand Company Ltd";
      case 0x0a48:
        return "JRC Mobility Inc.";
      case 0x0a49:
        return "Venture Research Inc.";
      case 0x0a4a:
        return "Map Large, Inc.";
      case 0x0a4b:
        return "MistyWest Energy and Transport Ltd.";
      case 0x0a4c:
        return "SiFli Technologies (shanghai) Inc.";
      case 0x0a4d:
        return "Lockn Technologies Private Limited";
      case 0x0a4e:
        return "Toytec Corporation";
      case 0x0a4f:
        return "VANMOOF Global Holding B.V.";
      case 0x0a50:
        return "Nextscape Inc.";
      case 0x0a51:
        return "CSIRO";
      case 0x0a52:
        return "Follow Sense Europe B.V.";
      case 0x0a53:
        return "KKM COMPANY LIMITED";
      case 0x0a54:
        return "SQL Technologies Corp.";
      case 0x0a55:
        return "Inugo Systems Limited";
      case 0x0a56:
        return "ambie";
      case 0x0a57:
        return "Meizhou Guo Wei Electronics Co., Ltd";
      case 0x0a58:
        return "Indigo Diabetes";
      case 0x0a59:
        return "TourBuilt, LLC";
      case 0x0a5a:
        return "Sontheim Industrie Elektronik GmbH";
      case 0x0a5b:
        return "LEGIC Identsystems AG";
      case 0x0a5c:
        return "Innovative Design Labs Inc.";
      case 0x0a5d:
        return "MG Energy Systems B.V.";
      case 0x0a5e:
        return "LaceClips llc";
      case 0x0a5f:
        return "stryker";
      case 0x0a60:
        return "DATANG SEMICONDUCTOR TECHNOLOGY CO.,LTD";
      case 0x0a61:
        return "Smart Parks B.V.";
      case 0x0a62:
        return "MOKO TECHNOLOGY Ltd";
      case 0x0a63:
        return "Gremsy JSC";
      case 0x0a64:
        return "Geopal system A/S";
      case 0x0a65:
        return "Lytx, INC.";
      case 0x0a66:
        return "JUSTMORPH PTE. LTD.";
      case 0x0a67:
        return "Beijing SuperHexa Century Technology CO. Ltd";
      case 0x0a68:
        return "Focus Ingenieria SRL";
      case 0x0a69:
        return "HAPPIEST BABY, INC.";
      case 0x0a6a:
        return "Scribble Design Inc.";
      case 0x0a6b:
        return "Olympic Ophthalmics, Inc.";
      case 0x0a6c:
        return "Pokkels";
      case 0x0a6d:
        return "KUUKANJYOKIN Co.,Ltd.";
      case 0x0a6e:
        return "Pac Sane Limited";
      case 0x0a6f:
        return "Warner Bros.";
      case 0x0a70:
        return "Ooma";
      case 0x0a71:
        return "Senquip Pty Ltd";
      case 0x0a72:
        return "Jumo GmbH & Co. KG";
      case 0x0a73:
        return "Innohome Oy";
      case 0x0a74:
        return "MICROSON S.A.";
      case 0x0a75:
        return "Delta Cycle Corporation";
      case 0x0a76:
        return "Synaptics Incorporated";
      case 0x0a77:
        return "AXTRO PTE. LTD.";
      case 0x0a78:
        return "Shenzhen Sunricher Technology Limited";
      case 0x0a79:
        return "Webasto SE";
      case 0x0a7a:
        return "Emlid Limited";
      case 0x0a7b:
        return "UniqAir Oy";
      case 0x0a7c:
        return "WAFERLOCK";
      case 0x0a7d:
        return "Freedman Electronics Pty Ltd";
      case 0x0a7e:
        return "KEBA Handover Automation GmbH";
      case 0x0a7f:
        return "Intuity Medical";
      case 0x0a80:
        return "Cleer Limited";
      case 0x0a81:
        return "Universal Biosensors Pty Ltd";
      case 0x0a82:
        return "Corsair";
      case 0x0a83:
        return "Rivata, Inc.";
      case 0x0a84:
        return "Greennote Inc,";
      case 0x0a85:
        return "Snowball Technology Co., Ltd.";
      case 0x0a86:
        return "ALIZENT International";
      case 0x0a87:
        return "Shanghai Smart System Technology Co., Ltd";
      case 0x0a88:
        return "PSA Peugeot Citroen";
      case 0x0a89:
        return "SES-Imagotag";
      case 0x0a8a:
        return "HAINBUCH GMBH SPANNENDE TECHNIK";
      case 0x0a8b:
        return "SANlight GmbH";
      case 0x0a8c:
        return "DelpSys, s.r.o.";
      case 0x0a8d:
        return "JCM TECHNOLOGIES S.A.";
      case 0x0a8e:
        return "Perfect Company";
      case 0x0a8f:
        return "TOTO LTD.";
      case 0x0a90:
        return "Shenzhen Grandsun Electronic Co.,Ltd.";
      case 0x0a91:
        return "Monarch International Inc.";
      case 0x0a92:
        return "Carestream Dental LLC";
      case 0x0a93:
        return "GiPStech S.r.l.";
      case 0x0a94:
        return "OOBIK Inc.";
      case 0x0a95:
        return "Pamex Inc.";
      case 0x0a96:
        return "Lightricity Ltd";
      case 0x0a97:
        return "SensTek";
      case 0x0a98:
        return "Foil, Inc.";
      case 0x0a99:
        return "Shanghai high-flying electronics technology Co.,Ltd";
      case 0x0a9a:
        return "TEMKIN ASSOCIATES, LLC";
      case 0x0a9b:
        return "Eello LLC";
      case 0x0a9c:
        return "Xi'an Fengyu Information Technology Co., Ltd.";
      case 0x0a9d:
        return "Canon Finetech Nisca Inc.";
      case 0x0a9e:
        return "LifePlus, Inc.";
      case 0x0a9f:
        return "ista International GmbH";
      case 0x0aa0:
        return "Loy Tec electronics GmbH";
      case 0x0aa1:
        return "LINCOGN TECHNOLOGY CO. LIMITED";
      case 0x0aa2:
        return "Care Bloom, LLC";
      case 0x0aa3:
        return "DIC Corporation";
      case 0x0aa4:
        return "FAZEPRO LLC";
      case 0x0aa5:
        return "Shenzhen Uascent Technology Co., Ltd";
      case 0x0aa6:
        return "Realityworks, inc.";
      case 0x0aa7:
        return "Urbanista AB";
      case 0x0aa8:
        return "Zencontrol Pty Ltd";
      case 0x0aa9:
        return "Spintly, Inc.";
      case 0x0aaa:
        return "Computime International Ltd";
      case 0x0aab:
        return "Anhui Listenai Co";
      case 0x0aac:
        return "OSM HK Limited";
      case 0x0aad:
        return "Adevo Consulting AB";
      case 0x0aae:
        return "PS Engineering, Inc.";
      case 0x0aaf:
        return "AIAIAI ApS";
      case 0x0ab0:
        return "Visiontronic s.r.o.";
      case 0x0ab1:
        return "InVue Security Products Inc";
      case 0x0ab2:
        return "TouchTronics, Inc.";
      case 0x0ab3:
        return "INNER RANGE PTY. LTD.";
      case 0x0ab4:
        return "Ellenby Technologies, Inc.";
      case 0x0ab5:
        return "Elstat Electronics Ltd.";
      case 0x0ab6:
        return "Xenter, Inc.";
      case 0x0ab7:
        return "LogTag North America Inc.";
      case 0x0ab8:
        return "Sens.ai Incorporated";
      case 0x0ab9:
        return "STL";
      case 0x0aba:
        return "Open Bionics Ltd.";
      case 0x0abb:
        return "R-DAS, s.r.o.";
      case 0x0abc:
        return "KCCS Mobile Engineering Co., Ltd.";
      case 0x0abd:
        return "Inventas AS";
      case 0x0abe:
        return "Robkoo Information & Technologies Co., Ltd.";
      case 0x0abf:
        return "PAUL HARTMANN AG";
      case 0x0ac0:
        return "Omni-ID USA, INC.";
      case 0x0ac1:
        return "Shenzhen Jingxun Technology Co., Ltd.";
      case 0x0ac2:
        return "RealMega Microelectronics technology (Shanghai) Co. Ltd.";
      case 0x0ac3:
        return "Kenzen, Inc.";
      case 0x0ac4:
        return "CODIUM";
      case 0x0ac5:
        return "Flexoptix GmbH";
      case 0x0ac6:
        return "Barnes Group Inc.";
      case 0x0ac7:
        return "Chengdu Aich Technology Co.,Ltd";
      case 0x0ac8:
        return "Keepin Co., Ltd.";
      case 0x0ac9:
        return "Swedlock AB";
      case 0x0aca:
        return "Shenzhen CoolKit Technology Co., Ltd";
      case 0x0acb:
        return "ise Individuelle Software und Elektronik GmbH";
      case 0x0acc:
        return "Nuvoton";
      case 0x0acd:
        return "Visuallex Sport International Limited";
      case 0x0ace:
        return "KOBATA GAUGE MFG. CO., LTD.";
      case 0x0acf:
        return "CACI Technologies";
      case 0x0ad0:
        return "Nordic Strong ApS";
      case 0x0ad1:
        return "EAGLE KINGDOM TECHNOLOGIES LIMITED";
      case 0x0ad2:
        return "Lautsprecher Teufel GmbH";
      case 0x0ad3:
        return "SSV Software Systems GmbH";
      case 0x0ad4:
        return "Zhuhai Pantum Electronisc Co., Ltd";
      case 0x0ad5:
        return "Streamit B.V.";
      case 0x0ad6:
        return "nymea GmbH";
      case 0x0ad7:
        return "AL-KO Geraete GmbH";
      case 0x0ad8:
        return "Franz Kaldewei GmbH&Co KG";
      case 0x0ad9:
        return "Shenzhen Aimore. Co.,Ltd";
      case 0x0ada:
        return "Codefabrik GmbH";
      case 0x0adb:
        return "Reelables, Inc.";
      case 0x0adc:
        return "Duravit AG";
      case 0x0add:
        return "Boss Audio";
      case 0x0ade:
        return "Vocera Communications, Inc.";
      case 0x0adf:
        return "Douglas Dynamics L.L.C.";
      case 0x0ae0:
        return "Viceroy Devices Corporation";
      case 0x0ae1:
        return "ChengDu ForThink Technology Co., Ltd.";
      case 0x0ae2:
        return "IMATRIX SYSTEMS, INC.";
      case 0x0ae3:
        return "GlobalMed";
      case 0x0ae4:
        return "DALI Alliance";
      case 0x0ae5:
        return "unu GmbH";
      case 0x0ae6:
        return "Hexology";
      case 0x0ae7:
        return "Sunplus Technology Co., Ltd.";
      case 0x0ae8:
        return "LEVEL, s.r.o.";
      case 0x0ae9:
        return "FLIR Systems AB";
      case 0x0aea:
        return "Borda Technology";
      case 0x0aeb:
        return "Square, Inc.";
      case 0x0aec:
        return "FUTEK ADVANCED SENSOR TECHNOLOGY, INC";
      case 0x0aed:
        return "Saxonar GmbH";
      case 0x0aee:
        return "Velentium, LLC";
      case 0x0aef:
        return "GLP German Light Products GmbH";
      case 0x0af0:
        return "Leupold & Stevens, Inc.";
      case 0x0af1:
        return "CRADERS,CO.,LTD";
      case 0x0af2:
        return "Shanghai All Link Microelectronics Co.,Ltd";
      case 0x0af3:
        return "701x Inc.";
      case 0x0af4:
        return "Radioworks Microelectronics PTY LTD";
      case 0x0af5:
        return "Unitech Electronic Inc.";
      case 0x0af6:
        return "AMETEK, Inc.";
      case 0x0af7:
        return "Irdeto";
      case 0x0af8:
        return "First Design System Inc.";
      case 0x0af9:
        return "Unisto AG";
      case 0x0afa:
        return "Chengdu Ambit Technology Co., Ltd.";
      case 0x0afb:
        return "SMT ELEKTRONIK GmbH";
      case 0x0afc:
        return "Cerebrum Sensor Technologies Inc.";
      case 0x0afd:
        return "Weber Sensors, LLC";
      case 0x0afe:
        return "Earda Technologies Co.,Ltd";
      case 0x0aff:
        return "FUSEAWARE LIMITED";
      case 0x0b00:
        return "Flaircomm Microelectronics Inc.";
      case 0x0b01:
        return "RESIDEO TECHNOLOGIES, INC.";
      case 0x0b02:
        return "IORA Technology Development Ltd. Sti.";
      case 0x0b03:
        return "Precision Triathlon Systems Limited";
      case 0x0b04:
        return "I-PERCUT";
      case 0x0b05:
        return "Marquardt GmbH";
      case 0x0b06:
        return "FAZUA GmbH";
      case 0x0b07:
        return "Workaround Gmbh";
      case 0x0b08:
        return "Shenzhen Qianfenyi Intelligent Technology Co., LTD";
      case 0x0b09:
        return "soonisys";
      case 0x0b0a:
        return "Belun Technology Company Limited";
      case 0x0b0b:
        return "Sanistaal A/S";
      case 0x0b0c:
        return "BluPeak";
      case 0x0b0d:
        return "SANYO DENKO Co.,Ltd.";
      case 0x0b0e:
        return "Honda Lock Mfg. Co.,Ltd.";
      case 0x0b0f:
        return "B.E.A. S.A.";
      case 0x0b10:
        return "Alfa Laval Corporate AB";
      case 0x0b11:
        return "ThermoWorks, Inc.";
      case 0x0b12:
        return "ToughBuilt Industries LLC";
      case 0x0b13:
        return "IOTOOLS";
      case 0x0b14:
        return "Olumee";
      case 0x0b15:
        return "NAOS JAPAN K.K.";
      case 0x0b16:
        return "Guard RFID Solutions Inc.";
      case 0x0b17:
        return "SIG SAUER, INC.";
      case 0x0b18:
        return "DECATHLON SE";
      case 0x0b19:
        return "WBS PROJECT H PTY LTD";
      case 0x0b1a:
        return "Roca Sanitario, S.A.";
      case 0x0b1b:
        return "Enerpac Tool Group Corp.";
      case 0x0b1c:
        return "Nanoleq AG";
      case 0x0b1d:
        return "Accelerated Systems";
      case 0x0b1e:
        return "PB INC.";
      case 0x0b1f:
        return "Beijing ESWIN Computing Technology Co., Ltd.";
      case 0x0b20:
        return "TKH Security B.V.";
      case 0x0b21:
        return "ams AG";
      case 0x0b22:
        return "Hygiene IQ, LLC.";
      case 0x0b23:
        return "iRhythm Technologies, Inc.";
      case 0x0b24:
        return "BeiJing ZiJie TiaoDong KeJi Co.,Ltd.";
      case 0x0b25:
        return "NIBROTECH LTD";
      case 0x0b26:
        return "Baracoda Daily Healthtech.";
      case 0x0b27:
        return "Lumi United Technology Co., Ltd";
      case 0x0b28:
        return "CHACON";
      case 0x0b29:
        return "Tech-Venom Entertainment Private Limited";
      case 0x0b2a:
        return "ACL Airshop B.V.";
      case 0x0b2b:
        return "MAINBOT";
      case 0x0b2c:
        return "ILLUMAGEAR, Inc.";
      case 0x0b2d:
        return "REDARC ELECTRONICS PTY LTD";
      case 0x0b2e:
        return "MOCA System Inc.";
      case 0x0b2f:
        return "Duke Manufacturing Co";
      case 0x0b30:
        return "ART SPA";
      case 0x0b31:
        return "Silver Wolf Vehicles Inc.";
      case 0x0b32:
        return "Hala Systems, Inc.";
      case 0x0b33:
        return "ARMATURA LLC";
      case 0x0b34:
        return "CONZUMEX INDUSTRIES PRIVATE LIMITED";
      case 0x0b35:
        return "BH SENS";
      case 0x0b36:
        return "SINTEF";
      case 0x0b37:
        return "Omnivoltaic Energy Solutions Limited Company";
      case 0x0b38:
        return "WISYCOM S.R.L.";
      case 0x0b39:
        return "Red 100 Lighting Co., ltd.";
      case 0x0b3a:
        return "Impact Biosystems, Inc.";
      case 0x0b3b:
        return "AIC semiconductor (Shanghai) Co., Ltd.";
      case 0x0b3c:
        return "Dodge Industrial, Inc.";
      case 0x0b3d:
        return "REALTIMEID AS";
      case 0x0b3e:
        return "ISEO Serrature S.p.a.";
      case 0x0b3f:
        return "MindRhythm, Inc.";
      case 0x0b40:
        return "Havells India Limited";
      case 0x0b41:
        return "Sentrax GmbH";
      case 0x0b42:
        return "TSI";
      case 0x0b43:
        return "INCITAT ENVIRONNEMENT";
      case 0x0b44:
        return "nFore Technology Co., Ltd.";
      case 0x0b45:
        return "Electronic Sensors, Inc.";
      case 0x0b46:
        return "Bird Rides, Inc.";
      case 0x0b47:
        return "Gentex Corporation";
      case 0x0b48:
        return "NIO USA, Inc.";
      case 0x0b49:
        return "SkyHawke Technologies";
      case 0x0b4a:
        return "Nomono AS";
      case 0x0b4b:
        return "EMS Integrators, LLC";
      case 0x0b4c:
        return "BiosBob.Biz";
      case 0x0b4d:
        return "Adam Hall GmbH";
      case 0x0b4e:
        return "ICP Systems B.V.";
      case 0x0b4f:
        return "Breezi.io, Inc.";
      case 0x0b50:
        return "Mesh Systems LLC";
      case 0x0b51:
        return "FUN FACTORY GmbH";
      case 0x0b52:
        return "ZIIP Inc";
      case 0x0b53:
        return "SHENZHEN KAADAS INTELLIGENT TECHNOLOGY CO.,Ltd";
      case 0x0b54:
        return "Emotion Fitness GmbH & Co. KG";
      case 0x0b55:
        return "H G M Automotive Electronics, Inc.";
      case 0x0b56:
        return "BORA - Vertriebs GmbH & Co KG";
      case 0x0b57:
        return "CONVERTRONIX TECHNOLOGIES AND SERVICES LLP";
      case 0x0b58:
        return "TOKAI-DENSHI INC";
      case 0x0b59:
        return "Versa Group B.V.";
      case 0x0b5a:
        return "H.P. Shelby Manufacturing, LLC.";
      case 0x0b5b:
        return "Shenzhen ImagineVision Technology Limited";
      case 0x0b5c:
        return "Exponential Power, Inc.";
      case 0x0b5d:
        return "Fujian Newland Auto-ID Tech. Co., Ltd.";
      case 0x0b5e:
        return "CELLCONTROL, INC.";
      case 0x0b5f:
        return "Rivieh, Inc.";
      case 0x0b60:
        return "RATOC Systems, Inc.";
      case 0x0b61:
        return "Sentek Pty Ltd";
      case 0x0b62:
        return "NOVEA ENERGIES";
      case 0x0b63:
        return "Innolux Corporation";
      case 0x0b64:
        return "NingBo klite Electric Manufacture Co.,LTD";
      case 0x0b65:
        return "The Apache Software Foundation";
      case 0x0b66:
        return "MITSUBISHI ELECTRIC AUTOMATION (THAILAND) COMPANY LIMITED";
      case 0x0b67:
        return "CleanSpace Technology Pty Ltd";
      case 0x0b68:
        return "Quha oy";
      case 0x0b69:
        return "Addaday";
      case 0x0b6a:
        return "Dymo";
      case 0x0b6b:
        return "Samsara Networks, Inc";
      case 0x0b6c:
        return "Sensitech, Inc.";
      case 0x0b6d:
        return "SOLUM CO., LTD";
      case 0x0b6e:
        return "React Mobile";
      case 0x0b6f:
        return "Shenzhen Malide Technology Co.,Ltd";
      case 0x0b70:
        return "JDRF Electromag Engineering Inc";
      case 0x0b71:
        return "lilbit ODM AS";
      case 0x0b72:
        return "Geeknet, Inc.";
      case 0x0b73:
        return "HARADA INDUSTRY CO., LTD.";
      case 0x0b74:
        return "BQN";
      case 0x0b75:
        return "Triple W Japan Inc.";
      case 0x0b76:
        return "MAX-co., ltd";
      case 0x0b77:
        return "Aixlink(Chengdu) Co., Ltd.";
      case 0x0b78:
        return "FIELD DESIGN INC.";
      case 0x0b79:
        return "Sankyo Air Tech Co.,Ltd.";
      case 0x0b7a:
        return "Shenzhen KTC Technology Co.,Ltd.";
      case 0x0b7b:
        return "Hardcoder Oy";
      case 0x0b7c:
        return "Scangrip A/S";
      case 0x0b7d:
        return "FoundersLane GmbH";
      case 0x0b7e:
        return "Offcode Oy";
      case 0x0b7f:
        return "ICU tech GmbH";
      case 0x0b80:
        return "AXELIFE";
      case 0x0b81:
        return "SCM Group";
      case 0x0b82:
        return "Mammut Sports Group AG";
      case 0x0b83:
        return "Taiga Motors Inc.";
      case 0x0b84:
        return "Presidio Medical, Inc.";
      case 0x0b85:
        return "VIMANA TECH PTY LTD";
      case 0x0b86:
        return "Trek Bicycle";
      case 0x0b87:
        return "Ampetronic Ltd";
      case 0x0b88:
        return "Muguang (Guangdong) Intelligent Lighting Technology Co., Ltd";
      case 0x0b89:
        return "Rotronic AG";
      case 0x0b8a:
        return "Seiko Instruments Inc.";
      case 0x0b8b:
        return "American Technology Components, Incorporated";
      case 0x0b8c:
        return "MOTREX";
      case 0x0b8d:
        return "Pertech Industries Inc";
      case 0x0b8e:
        return "Gentle Energy Corp.";
      case 0x0b8f:
        return "Senscomm Semiconductor Co., Ltd.";
      case 0x0b90:
        return "Ineos Automotive Limited";
      case 0x0b91:
        return "Alfen ICU B.V.";
      case 0x0b92:
        return "Citisend Solutions, SL";
      case 0x0b93:
        return "Hangzhou BroadLink Technology Co., Ltd.";
      case 0x0b94:
        return "Dreem SAS";
      case 0x0b95:
        return "Netwake GmbH";
      case 0x0b96:
        return "Telecom Design";
      case 0x0b97:
        return "SILVER TREE LABS, INC.";
      case 0x0b98:
        return "Gymstory B.V.";
      case 0x0b99:
        return "The Goodyear Tire & Rubber Company";
      case 0x0b9a:
        return "Beijing Wisepool Infinite Intelligence Technology Co.,Ltd";
      case 0x0b9b:
        return "GISMAN";
      case 0x0b9c:
        return "Komatsu Ltd.";
      case 0x0b9d:
        return "Sensoria Holdings LTD";
      case 0x0b9e:
        return "Audio Partnership Plc";
      case 0x0b9f:
        return "Group Lotus Limited";
      case 0x0ba0:
        return "Data Sciences International";
      case 0x0ba1:
        return "Bunn-O-Matic Corporation";
      case 0x0ba2:
        return "TireCheck GmbH";
      case 0x0ba3:
        return "Sonova Consumer Hearing GmbH";
      case 0x0ba4:
        return "Vervent Audio Group";
      case 0x0ba5:
        return "SONICOS ENTERPRISES, LLC";
      case 0x0ba6:
        return "Nissan Motor Co., Ltd.";
      case 0x0ba7:
        return "hearX Group (Pty) Ltd";
      case 0x0ba8:
        return "GLOWFORGE INC.";
      case 0x0ba9:
        return "Allterco Robotics ltd";
      case 0x0baa:
        return "Infinitegra, Inc.";
      case 0x0bab:
        return "Grandex International Corporation";
      case 0x0bac:
        return "Machfu Inc.";
      case 0x0bad:
        return "Roambotics, Inc.";
      case 0x0bae:
        return "Soma Labs LLC";
      case 0x0baf:
        return "NITTO KOGYO CORPORATION";
      case 0x0bb0:
        return "Ecolab Inc.";
      case 0x0bb1:
        return "Beijing ranxin intelligence technology Co.,LTD";
      case 0x0bb2:
        return "Fjorden Electra AS";
      case 0x0bb3:
        return "Flender GmbH";
      case 0x0bb4:
        return "New Cosmos USA, Inc.";
      case 0x0bb5:
        return "Xirgo Technologies, LLC";
      case 0x0bb6:
        return "Build With Robots Inc.";
      case 0x0bb7:
        return "IONA Tech LLC";
      case 0x0bb8:
        return "INNOVAG PTY. LTD.";
      case 0x0bb9:
        return "SaluStim Group Oy";
      case 0x0bba:
        return "Huso, INC";
      case 0x0bbb:
        return "SWISSINNO SOLUTIONS AG";
      case 0x0bbc:
        return "T2REALITY SOLUTIONS PRIVATE LIMITED";
      case 0x0bbd:
        return "ETHEORY PTY LTD";
      case 0x0bbe:
        return "SAAB Aktiebolag";
      case 0x0bbf:
        return "HIMSA II K/S";
      case 0x0bc0:
        return "READY FOR SKY LLP";
      case 0x0bc1:
        return "Miele & Cie. KG";
      case 0x0bc2:
        return "EntWick Co.";
      case 0x0bc3:
        return "MCOT INC.";
      case 0x0bc4:
        return "TECHTICS ENGINEERING B.V.";
      case 0x0bc5:
        return "Aperia Technologies, Inc.";
      case 0x0bc6:
        return "TCL COMMUNICATION EQUIPMENT CO.,LTD.";
      case 0x0bc7:
        return "Signtle Inc.";
      case 0x0bc8:
        return "OTF Distribution, LLC";
      case 0x0bc9:
        return "Neuvatek Inc.";
      case 0x0bca:
        return "Perimeter Technologies, Inc.";
      case 0x0bcb:
        return "Divesoft s.r.o.";
      case 0x0bcc:
        return "Sylvac sa";
      case 0x0bcd:
        return "Amiko srl";
      case 0x0bce:
        return "Neurosity, Inc.";
      case 0x0bcf:
        return "LL Tec Group LLC";
      case 0x0bd0:
        return "Durag GmbH";
      case 0x0bd1:
        return "Hubei Yuan Times Technology Co., Ltd.";
      case 0x0bd2:
        return "IDEC";
      case 0x0bd3:
        return "Procon Analytics, LLC";
      case 0x0bd4:
        return "ndd Medizintechnik AG";
      case 0x0bd5:
        return "Super B Lithium Power B.V.";
      case 0x0bd6:
        return "Shenzhen Injoinic Technology Co., Ltd.";
      case 0x0bd7:
        return "VINFAST TRADING AND PRODUCTION JOINT STOCK COMPANY";
      case 0x0bd8:
        return "PURA SCENTS, INC.";
      case 0x0bd9:
        return "Elics Basis Ltd.";
      case 0x0bda:
        return "Aardex Ltd.";
      case 0x0bdb:
        return "CHAR-BROIL, LLC";
      case 0x0bdc:
        return "Ledworks S.r.l.";
      case 0x0bdd:
        return "Coroflo Limited";
      case 0x0bde:
        return "Yale";
      case 0x0bdf:
        return "WINKEY ENTERPRISE (HONG KONG) LIMITED";
      case 0x0be0:
        return "Koizumi Lighting Technology corp.";
      case 0x0be1:
        return "Back40 Precision";
      case 0x0be2:
        return "OTC engineering";
      case 0x0be3:
        return "Comtel Systems Ltd.";
      case 0x0be4:
        return "Deepfield Connect GmbH";
      case 0x0be5:
        return "ZWILLING J.A. Henckels Aktiengesellschaft";
      case 0x0be6:
        return "Puratap Pty Ltd";
      case 0x0be7:
        return "Fresnel Technologies, Inc.";
      case 0x0be8:
        return "Sensormate AG";
      case 0x0be9:
        return "Shindengen Electric Manufacturing Co., Ltd.";
      case 0x0bea:
        return "Twenty Five Seven, prodaja in storitve, d.o.o.";
      case 0x0beb:
        return "Luna Health, Inc.";
      case 0x0bec:
        return "Miracle-Ear, Inc.";
      case 0x0bed:
        return "CORAL-TAIYI Co. Ltd.";
      case 0x0bee:
        return "LINKSYS USA, INC.";
      case 0x0bef:
        return "Safetytest GmbH";
      case 0x0bf0:
        return "KIDO SPORTS CO., LTD.";
      case 0x0bf1:
        return "Site IQ LLC";
      case 0x0bf2:
        return "Angel Medical Systems, Inc.";
      case 0x0bf3:
        return "PONE BIOMETRICS AS";
      case 0x0bf4:
        return "ER Lab LLC";
      case 0x0bf5:
        return "T5 tek, Inc.";
      case 0x0bf6:
        return "greenTEG AG";
      case 0x0bf7:
        return "Wacker Neuson SE";
      case 0x0bf8:
        return "Innovacionnye Resheniya";
      case 0x0bf9:
        return "Alio, Inc";
      case 0x0bfa:
        return "CleanBands Systems Ltd.";
      case 0x0bfb:
        return "Dodam Enersys Co., Ltd";
      case 0x0bfc:
        return "T+A elektroakustik GmbH & Co.KG";
      case 0x0bfd:
        return "Esmé Solutions";
      case 0x0bfe:
        return "Media-Cartec GmbH";
      case 0x0bff:
        return "Ratio Electric BV";
      case 0x0c00:
        return "MQA Limited";
      case 0x0c01:
        return "NEOWRK SISTEMAS INTELIGENTES S.A.";
      case 0x0c02:
        return "Loomanet, Inc.";
      case 0x0c03:
        return "Puff Corp";
      case 0x0c04:
        return "Happy Health, Inc.";
      case 0x0c05:
        return "Montage Connect, Inc.";
      case 0x0c06:
        return "LED Smart Inc.";
      case 0x0c07:
        return "CONSTRUKTS, INC.";
      case 0x0c08:
        return 'limited liability company "Red"';
      case 0x0c09:
        return "Senic Inc.";
      case 0x0c0a:
        return "Automated Pet Care Products, LLC";
      case 0x0c0b:
        return "aconno GmbH";
      case 0x0c0c:
        return "Mendeltron, Inc.";
      case 0x0c0d:
        return "Mereltron bv";
      case 0x0c0e:
        return "ALEX DENKO CO.,LTD.";
      case 0x0c0f:
        return "AETERLINK";
      case 0x0c10:
        return "Cosmed s.r.l.";
      case 0x0c11:
        return "Gordon Murray Design Limited";
      case 0x0c12:
        return "IoSA";
      case 0x0c13:
        return "Scandinavian Health Limited";
      case 0x0c14:
        return "Fasetto, Inc.";
      case 0x0c15:
        return "Geva Sol B.V.";
      case 0x0c16:
        return "TYKEE PTY. LTD.";
      case 0x0c17:
        return "SomnoMed Limited";
      case 0x0c18:
        return "CORROHM";
      case 0x0c19:
        return "Arlo Technologies, Inc.";
      case 0x0c1a:
        return "Catapult Group International Ltd";
      case 0x0c1b:
        return "Rockchip Electronics Co., Ltd.";
      case 0x0c1c:
        return "GEMU";
      case 0x0c1d:
        return "OFF Line Japan Co., Ltd.";
      case 0x0c1e:
        return "EC sense co., Ltd";
      case 0x0c1f:
        return "LVI Co.";
      case 0x0c20:
        return "COMELIT GROUP S.P.A.";
      case 0x0c21:
        return "Foshan Viomi Electrical Technology Co., Ltd";
      case 0x0c22:
        return "Glamo Inc.";
      case 0x0c23:
        return "KEYTEC,Inc.";
      case 0x0c24:
        return "SMARTD TECHNOLOGIES INC.";
      case 0x0c25:
        return "JURA Elektroapparate AG";
      case 0x0c26:
        return "Performance Electronics, Ltd.";
      case 0x0c27:
        return "Pal Electronics";
      case 0x0c28:
        return "Embecta Corp.";
      case 0x0c29:
        return "DENSO AIRCOOL CORPORATION";
      case 0x0c2a:
        return "Caresix Inc.";
      case 0x0c2b:
        return "GigaDevice Semiconductor Inc.";
      case 0x0c2c:
        return "Zeku Technology (Shanghai) Corp., Ltd.";
      case 0x0c2d:
        return "OTF Product Sourcing, LLC";
      case 0x0c2e:
        return "Easee AS";
      case 0x0c2f:
        return "BEEHERO, INC.";
      case 0x0c30:
        return "McIntosh Group Inc";
      case 0x0c31:
        return "KINDOO LLP";
      case 0x0c32:
        return "Xian Yisuobao Electronic Technology Co., Ltd.";
      case 0x0c33:
        return "Exeger Operations AB";
      case 0x0c34:
        return "BYD Company Limited";
      case 0x0c35:
        return "Thermokon-Sensortechnik GmbH";
      case 0x0c36:
        return "Cosmicnode BV";
      case 0x0c37:
        return "SignalQuest, LLC";
      case 0x0c38:
        return "Noritz Corporation.";
      case 0x0c39:
        return "TIGER CORPORATION";
      case 0x0c3a:
        return "Equinosis, LLC";
      case 0x0c3b:
        return "ORB Innovations Ltd";
      case 0x0c3c:
        return "Classified Cycling";
      case 0x0c3d:
        return "Wrmth Corp.";
      case 0x0c3e:
        return "BELLDESIGN Inc.";
      case 0x0c3f:
        return "Stinger Equipment, Inc.";
      case 0x0c40:
        return "HORIBA, Ltd.";
      case 0x0c41:
        return "Control Solutions LLC";
      case 0x0c42:
        return "Heath Consultants Inc.";
      case 0x0c43:
        return "Berlinger & Co. AG";
      case 0x0c44:
        return "ONCELABS LLC";
      case 0x0c45:
        return "Brose Verwaltung SE, Bamberg";
      case 0x0c46:
        return "Granwin IoT Technology (Guangzhou) Co.,Ltd";
      case 0x0c47:
        return "Epsilon Electronics,lnc";
      case 0x0c48:
        return "VALEO MANAGEMENT SERVICES";
      case 0x0c49:
        return "twopounds gmbh";
      case 0x0c4a:
        return "atSpiro ApS";
      case 0x0c4b:
        return "ADTRAN, Inc.";
      case 0x0c4c:
        return "Orpyx Medical Technologies Inc.";
      case 0x0c4d:
        return "Seekwave Technology Co.,ltd.";
      case 0x0c4e:
        return "Tactile Engineering, Inc.";
      case 0x0c4f:
        return "SharkNinja Operating LLC";
      case 0x0c50:
        return "Imostar Technologies Inc.";
      case 0x0c51:
        return "INNOVA S.R.L.";
      case 0x0c52:
        return "ESCEA LIMITED";
      case 0x0c53:
        return "Taco, Inc.";
      case 0x0c54:
        return "HiViz Lighting, Inc.";
      case 0x0c55:
        return "Zintouch B.V.";
      case 0x0c56:
        return "Rheem Sales Company, Inc.";
      case 0x0c57:
        return "UNEEG medical A/S";
      case 0x0c58:
        return "Hykso Inc.";
      case 0x0c59:
        return "CYBERDYNE Inc.";
      case 0x0c5a:
        return "Lockswitch Sdn Bhd";
      case 0x0c5b:
        return "Alban Giacomo S.P.A.";
      case 0x0c5c:
        return "MGM WIRELESSS HOLDINGS PTY LTD";
      case 0x0c5d:
        return "StepUp Solutions ApS";
      case 0x0c5e:
        return "BlueID GmbH";
      case 0x0c5f:
        return "Wuxi Linkpower Microelectronics Co.,Ltd";
      case 0x0c60:
        return "KEBA Energy Automation GmbH";
      case 0x0c61:
        return "NNOXX, Inc";
      case 0x0c62:
        return "Phiaton Corporation";
      case 0x0c63:
        return "phg Peter Hengstler GmbH + Co. KG";
      case 0x0c64:
        return "dormakaba Holding AG";
      case 0x0c65:
        return "WAKO CO,.LTD";
      case 0x0c66:
        return "DEN Smart Home B.V.";
      case 0x0c67:
        return "TRACKTING S.R.L.";
      case 0x0c68:
        return "Emerja Corporation";
      case 0x0c69:
        return "BLITZ electric motors. LTD";
      case 0x0c6a:
        return "CONSORCIO TRUST CONTROL - NETTEL";
      case 0x0c6b:
        return "GILSON SAS";
      case 0x0c6c:
        return "SNIFF LOGIC LTD";
      case 0x0c6d:
        return "Fidure Corp.";
      case 0x0c6e:
        return "Sensa LLC";
      case 0x0c6f:
        return "Parakey AB";
      case 0x0c70:
        return "SCARAB SOLUTIONS LTD";
      case 0x0c71:
        return "BitGreen Technolabz (OPC) Private Limited";
      case 0x0c72:
        return "StreetCar ORV, LLC";
      case 0x0c73:
        return "Truma Gerätetechnik GmbH & Co. KG";
      case 0x0c74:
        return "yupiteru";
      case 0x0c75:
        return "Embedded Engineering Solutions LLC";
      case 0x0c76:
        return "Shenzhen Gwell Times Technology Co. , Ltd";
      case 0x0c77:
        return "TEAC Corporation";
      case 0x0c78:
        return "CHARGTRON IOT PRIVATE LIMITED";
      case 0x0c79:
        return "Zhuhai Smartlink Technology Co., Ltd";
      case 0x0c7a:
        return "Triductor Technology (Suzhou), Inc.";
      case 0x0c7b:
        return "PT SADAMAYA GRAHA TEKNOLOGI";
      case 0x0c7c:
        return "Mopeka Products LLC";
      case 0x0c7d:
        return "3ALogics, Inc.";
      case 0x0c7e:
        return "BOOMING OF THINGS";
      case 0x0c7f:
        return "Rochester Sensors, LLC";
      case 0x0c80:
        return "CARDIOID - TECHNOLOGIES, LDA";
      case 0x0c81:
        return "Carrier Corporation";
      case 0x0c82:
        return "NACON";
      case 0x0c83:
        return "Watchdog Systems LLC";
      case 0x0c84:
        return "MAXON INDUSTRIES, INC.";
      case 0x0c85:
        return "Amlogic, Inc.";
      case 0x0c86:
        return "Qingdao Eastsoft Communication Technology Co.,Ltd";
      case 0x0c87:
        return "Weltek Technologies Company Limited";
      case 0x0c88:
        return "Nextivity Inc.";
      case 0x0c89:
        return "AGZZX OPTOELECTRONICS TECHNOLOGY CO., LTD";
      case 0x0c8a:
        return "A.GLOBAL co.,Ltd.";
      case 0x0c8b:
        return "Heavys Inc";
      case 0x0c8c:
        return "T-Mobile USA";
      case 0x0c8d:
        return "tonies GmbH";
      case 0x0c8e:
        return "Technocon Engineering Ltd.";
      case 0x0c8f:
        return "Radar Automobile Sales(Shandong)Co.,Ltd.";
      case 0x0c90:
        return "WESCO AG";
      case 0x0c91:
        return "Yashu Systems";
      case 0x0c92:
        return "Kesseböhmer Ergonomietechnik GmbH";
      case 0x0c93:
        return "Movesense Oy";
      case 0x0c94:
        return "Baxter Healthcare Corporation";
      case 0x0c95:
        return "Gemstone Lights Canada Ltd.";
      case 0x0c96:
        return "H+B Hightech GmbH";
      case 0x0c97:
        return "Deako";
      case 0x0c98:
        return "MiX Telematics International (PTY) LTD";
      case 0x0c99:
        return "Vire Health Oy";
      case 0x0c9a:
        return "ALF Inc.";
      case 0x0c9b:
        return "NTT sonority, Inc.";
      case 0x0c9c:
        return "Sunstone-RTLS Ipari Szolgaltato Korlatolt Felelossegu Tarsasag";
      case 0x0c9d:
        return "Ribbiot, INC.";
      case 0x0c9e:
        return "ECCEL CORPORATION SAS";
      case 0x0c9f:
        return "Dragonfly Energy Corp.";
      case 0x0ca0:
        return "BIGBEN";
      case 0x0ca1:
        return "YAMAHA MOTOR CO.,LTD.";
      case 0x0ca2:
        return "XSENSE LTD";
      case 0x0ca3:
        return "MAQUET GmbH";
      case 0x0ca4:
        return "MITSUBISHI ELECTRIC LIGHTING CO, LTD";
      case 0x0ca5:
        return "Princess Cruise Lines, Ltd.";
      case 0x0ca6:
        return "Megger Ltd";
      case 0x0ca7:
        return "Verve InfoTec Pty Ltd";
      case 0x0ca8:
        return "Sonas, Inc.";
      case 0x0ca9:
        return "Mievo Technologies Private Limited";
      case 0x0caa:
        return "Shenzhen Poseidon Network Technology Co., Ltd";
      case 0x0cab:
        return "HERUTU ELECTRONICS CORPORATION";
      case 0x0cac:
        return "Shenzhen Shokz Co.,Ltd.";
      case 0x0cad:
        return "Shenzhen Openhearing Tech CO., LTD .";
      case 0x0cae:
        return "Evident Corporation";
      case 0x0caf:
        return "NEURINNOV";
      case 0x0cb0:
        return "SwipeSense, Inc.";
      case 0x0cb1:
        return "RF Creations";
      case 0x0cb2:
        return "SHINKAWA Sensor Technology, Inc.";
      case 0x0cb3:
        return "janova GmbH";
      case 0x0cb4:
        return "Eberspaecher Climate Control Systems GmbH";
      case 0x0cb5:
        return "Racketry, d. o. o.";
      case 0x0cb6:
        return "THE EELECTRIC MACARON LLC";
      case 0x0cb7:
        return "Cucumber Lighting Controls Limited";
      case 0x0cb8:
        return "Shanghai Proxy Network Technology Co., Ltd.";
      case 0x0cb9:
        return "seca GmbH & Co. KG";
      case 0x0cba:
        return "Ameso Tech (OPC) Private Limited";
      case 0x0cbb:
        return "Emlid Tech Kft.";
      case 0x0cbc:
        return "TROX GmbH";
      case 0x0cbd:
        return "Pricer AB";
      case 0x0cbf:
        return "Forward Thinking Systems LLC.";
      case 0x0cc0:
        return "Garnet Instruments Ltd.";
      case 0x0cc1:
        return "CLEIO Inc.";
      case 0x0cc2:
        return "Anker Innovations Limited";
      case 0x0cc3:
        return "HMD Global Oy";
      case 0x0cc4:
        return "ABUS August Bremicker Soehne Kommanditgesellschaft";
      case 0x0cc5:
        return "Open Road Solutions, Inc.";
      case 0x0cc6:
        return "Serial Technology Corporation";
      case 0x0cc7:
        return "SB C&S Corp.";
      case 0x0cc8:
        return "TrikThom";
      case 0x0cc9:
        return "Innocent Technology Co., Ltd.";
      case 0x0cca:
        return "Cyclops Marine Ltd";
      case 0x0ccb:
        return "NOTHING TECHNOLOGY LIMITED";
      case 0x0ccc:
        return "Kord Defence Pty Ltd";
      case 0x0ccd:
        return "YanFeng Visteon(Chongqing) Automotive Electronic Co.,Ltd";
      case 0x0cce:
        return "SENOSPACE LLC";
      case 0x0ccf:
        return "Shenzhen CESI Information Technology Co., Ltd.";
      case 0x0cd0:
        return "MooreSilicon Semiconductor Technology (Shanghai) Co., LTD.";
      case 0x0cd1:
        return "Imagine Marketing Limited";
      case 0x0cd2:
        return "EQOM SSC B.V.";
      case 0x0cd3:
        return "TechSwipe";
      case 0x0cd4:
        return "Reoqoo IoT Technology Co., Ltd.";
      case 0x0cd5:
        return "Numa Products, LLC";
      case 0x0cd6:
        return "HHO (Hangzhou) Digital Technology Co., Ltd.";
      case 0x0cd7:
        return "Maztech Industries, LLC";
      case 0x0cd8:
        return "SIA Mesh Group";
      case 0x0cd9:
        return "Minami acoustics Limited";
      case 0x0cda:
        return "Wolf Steel ltd";
      case 0x0cdb:
        return "Circus World Displays Limited";
      case 0x0cdc:
        return "Ypsomed AG";
      case 0x0cdd:
        return "Alif Semiconductor, Inc.";
      case 0x0cde:
        return "RESPONSE TECHNOLOGIES, LTD.";
      case 0x0cdf:
        return "SHENZHEN CHENYUN ELECTRONICS  CO., LTD";
      case 0x0ce0:
        return "VODALOGIC PTY LTD";
      case 0x0ce1:
        return "Regal Beloit America, Inc.";
      case 0x0ce2:
        return "CORVENT MEDICAL, INC.";
      case 0x0ce3:
        return "Taiwan Fuhsing";
      case 0x0ce4:
        return "Off-Highway Powertrain Services Germany GmbH";
      case 0x0ce5:
        return "Amina Distribution AS";
      case 0x0ce6:
        return "McWong International, Inc.";
      case 0x0ce7:
        return "TAG HEUER SA";
      case 0x0ce8:
        return "Dongguan Yougo Electronics Co.,Ltd.";
      case 0x0ce9:
        return "PEAG, LLC dba JLab Audio";
      case 0x0cea:
        return "HAYWARD INDUSTRIES, INC.";
      case 0x0ceb:
        return "Shenzhen Tingting Technology Co. LTD";
      case 0x0cec:
        return "Pacific Coast Fishery Services (2003) Inc.";
      case 0x0ced:
        return "CV. NURI TEKNIK";
      case 0x0cee:
        return "MadgeTech, Inc";
      case 0x0cef:
        return "POGS B.V.";
      case 0x0cf0:
        return "THOTAKA TEKHNOLOGIES INDIA PRIVATE LIMITED";
      case 0x0cf1:
        return "Midmark";
      case 0x0cf2:
        return "BestSens AG";
      case 0x0cf3:
        return "Radio Sound";
      case 0x0cf4:
        return "SOLUX PTY LTD";
      case 0x0cf5:
        return "BOS Balance of Storage Systems AG";
      case 0x0cf6:
        return "OJ Electronics A/S";
      case 0x0cf7:
        return "TVS Motor Company Ltd.";
      case 0x0cf8:
        return "core sensing GmbH";
      case 0x0cf9:
        return "Tamblue Oy";
      case 0x0cfa:
        return "Protect Animals With Satellites LLC";
      case 0x0cfb:
        return "Tyromotion GmbH";
      case 0x0cfc:
        return "ElectronX design";
      case 0x0cfd:
        return "Wuhan Woncan Construction Technologies Co., Ltd.";
      case 0x0cfe:
        return "Thule Group AB";
      case 0x0cff:
        return "Ergodriven Inc";
      case 0x0d00:
        return "Sparkpark AS";
      case 0x0d01:
        return "KEEPEN";
      case 0x0d02:
        return "Rocky Mountain ATV/MC Jake Wilson";
      case 0x0d03:
        return "MakuSafe Corp";
      case 0x0d04:
        return "Bartec Auto Id Ltd";
      case 0x0d05:
        return "Energy Technology and Control Limited";
      case 0x0d06:
        return "doubleO Co., Ltd.";
      case 0x0d07:
        return "Datalogic S.r.l.";
      case 0x0d08:
        return "Datalogic USA, Inc.";
      case 0x0d09:
        return "Leica Geosystems AG";
      case 0x0d0a:
        return "CATEYE Co., Ltd.";
      case 0x0d0b:
        return "Research Products Corporation";
      case 0x0d0c:
        return "Planmeca Oy";
      case 0x0d0d:
        return "C.Ed. Schulte GmbH Zylinderschlossfabrik";
      case 0x0d0e:
        return "PetVoice Co., Ltd.";
      case 0x0d0f:
        return "Timebirds Australia Pty Ltd";
      case 0x0d10:
        return "JVC KENWOOD Corporation";
      case 0x0d11:
        return "Great Dane LLC";
      case 0x0d12:
        return "Spartek Systems Inc.";
      case 0x0d13:
        return "MERRY ELECTRONICS CO., LTD.";
      case 0x0d14:
        return "Merry Electronics (S) Pte Ltd";
      case 0x0d15:
        return "Spark";
      case 0x0d16:
        return "Nations Technologies Inc.";
      case 0x0d17:
        return "Akix S.r.l.";
      case 0x0d18:
        return "Bioliberty Ltd";
      case 0x0d19:
        return "C.G. Air Systemes Inc.";
      case 0x0d1a:
        return "Maturix ApS";
      case 0x0d1b:
        return "RACHIO, INC.";
      case 0x0d1c:
        return "LIMBOID LLC";
      case 0x0d1d:
        return "Electronics4All Inc.";
      case 0x0d1e:
        return "FESTINA LOTUS SA";
      case 0x0d1f:
        return "Synkopi, Inc.";
      case 0x0d20:
        return "SCIENTERRA LIMITED";
      case 0x0d21:
        return "Cennox Group Limited";
      case 0x0d22:
        return "Cedarware, Corp.";
      case 0x0d23:
        return "GREE Electric Appliances, Inc. of Zhuhai";
      case 0x0d24:
        return "Japan Display Inc.";
      case 0x0d25:
        return "System Elite Holdings Group Limited";
      case 0x0d26:
        return "Burkert Werke GmbH & Co. KG";
      case 0x0d27:
        return "velocitux";
      case 0x0d28:
        return "FUJITSU COMPONENT LIMITED";
      case 0x0d29:
        return "MIYAKAWA ELECTRIC WORKS LTD.";
      case 0x0d2a:
        return "PhysioLogic Devices, Inc.";
      case 0x0d2b:
        return "Sensoryx AG";
      case 0x0d2c:
        return "SIL System Integration Laboratory GmbH";
      case 0x0d2d:
        return "Cooler Pro, LLC";
      case 0x0d2e:
        return "Advanced Electronic Applications, Inc";
      case 0x0d2f:
        return "Delta Development Team, Inc";
      case 0x0d30:
        return "Laxmi Therapeutic Devices, Inc.";
      case 0x0d31:
        return "SYNCHRON, INC.";
      case 0x0d32:
        return "Badger Meter";
      case 0x0d33:
        return "Micropower Group AB";
      case 0x0d34:
        return "ZILLIOT TECHNOLOGIES PRIVATE LIMITED";
      case 0x0d35:
        return "Universidad Politecnica de Madrid";
      case 0x0d36:
        return "XIHAO INTELLIGENGT TECHNOLOGY CO., LTD";
      case 0x0d37:
        return "Zerene Inc.";
      case 0x0d38:
        return "CycLock";
      case 0x0d39:
        return "Systemic Games, LLC";
      case 0x0d3a:
        return "Frost Solutions, LLC";
      case 0x0d3b:
        return "Lone Star Marine Pty Ltd";
      case 0x0d3c:
        return "SIRONA Dental Systems GmbH";
      case 0x0d3d:
        return "bHaptics Inc.";
      case 0x0d3e:
        return "LUMINOAH, INC.";
      case 0x0d3f:
        return "Vogels Products B.V.";
      case 0x0d40:
        return "SignalFire Telemetry, Inc.";
      case 0x0d41:
        return "CPAC Systems AB";
      case 0x0d42:
        return "TEKTRO TECHNOLOGY CORPORATION";
      case 0x0d43:
        return "Gosuncn Technology Group Co., Ltd.";
      case 0x0d44:
        return "Ex Makhina Inc.";
      case 0x0d45:
        return "Odeon, Inc.";
      case 0x0d46:
        return "Thales Simulation & Training AG";
      case 0x0d47:
        return "Shenzhen DOKE Electronic Co., Ltd";
      case 0x0d48:
        return "Vemcon GmbH";
      case 0x0d49:
        return "Refrigerated Transport Electronics, Inc.";
      case 0x0d4a:
        return "Rockpile Solutions, LLC";
      case 0x0d4b:
        return "Soundwave Hearing, LLC";
      case 0x0d4c:
        return "IotGizmo Corporation";
      case 0x0d4d:
        return "Optec, LLC";
      case 0x0d4e:
        return "NIKAT SOLUTIONS PRIVATE LIMITED";
      case 0x0d4f:
        return "Movano Inc.";
      case 0x0d50:
        return "NINGBO FOTILE KITCHENWARE CO., LTD.";
      case 0x0d51:
        return "Genetus inc.";
      case 0x0d52:
        return "DIVAN TRADING CO., LTD.";
      case 0x0d53:
        return "Luxottica Group S.p.A";
      case 0x0d54:
        return "ISEKI FRANCE S.A.S";
      case 0x0d55:
        return "NO CLIMB PRODUCTS LTD";
      case 0x0d56:
        return "Wellang.Co,.Ltd";
      case 0x0d57:
        return "Nanjing Xinxiangyuan Microelectronics Co., Ltd.";
      case 0x0d58:
        return "ifm electronic gmbh";
      case 0x0d59:
        return "HYUPSUNG MACHINERY ELECTRIC CO., LTD.";
      case 0x0d5a:
        return "Gunnebo Aktiebolag";
      case 0x0d5b:
        return "Axis Communications AB";
      case 0x0d5c:
        return "Pison Technology, Inc.";
      case 0x0d5d:
        return "Stogger B.V.";
      case 0x0d5e:
        return "Pella Corp";
      case 0x0d5f:
        return "SiChuan Homme Intelligent Technology co.,Ltd.";
      case 0x0d60:
        return "Smart Products Connection, S.A.";
      case 0x0d61:
        return "F.I.P. FORMATURA INIEZIONE POLIMERI - S.P.A.";
      case 0x0d62:
        return "MEBSTER s.r.o.";
      case 0x0d63:
        return "SKF France";
      case 0x0d64:
        return "Southco";
      case 0x0d65:
        return "Molnlycke Health Care AB";
      case 0x0d66:
        return "Hendrickson USA , L.L.C";
      case 0x0d67:
        return "BLACK BOX NETWORK SERVICES INDIA PRIVATE LIMITED";
      case 0x0d68:
        return "Status Audio LLC";
      case 0x0d69:
        return "AIR AROMA INTERNATIONAL PTY LTD";
      case 0x0d6a:
        return "Helge Kaiser GmbH";
      case 0x0d6b:
        return "Crane Payment Innovations, Inc.";
      case 0x0d6c:
        return "Ambient IoT Pty Ltd";
      case 0x0d6d:
        return "DYNAMOX S/A";
      case 0x0d6e:
        return "Look Cycle International";
      case 0x0d6f:
        return "Closed Joint Stock Company NVP BOLID";
      case 0x0d70:
        return "Kindhome";
      case 0x0d71:
        return "Kiteras Inc.";
      case 0x0d72:
        return "Earfun Technology (HK) Limited";
      case 0x0d73:
        return "iota Biosciences, Inc.";
      case 0x0d74:
        return "ANUME s.r.o.";
      case 0x0d75:
        return "Indistinguishable From Magic, Inc.";
      case 0x0d76:
        return "i-focus Co.,Ltd";
      case 0x0d77:
        return "DualNetworks SA";
      case 0x0d78:
        return "MITACHI CO.,LTD.";
      case 0x0d79:
        return "VIVIWARE JAPAN, Inc.";
      case 0x0d7a:
        return "Xiamen Intretech Inc.";
      case 0x0d7b:
        return "MindMaze SA";
      case 0x0d7c:
        return "BeiJing SmartChip Microelectronics Technology Co.,Ltd";
      case 0x0d7d:
        return "Taiko Audio B.V.";
      case 0x0d7e:
        return "Daihatsu Motor Co., Ltd.";
      case 0x0d7f:
        return "Konova";
      case 0x0d80:
        return "Gravaa B.V.";
      case 0x0d81:
        return "Beyerdynamic GmbH & Co. KG";
      case 0x0d82:
        return "VELCO";
      case 0x0d83:
        return "ATLANTIC SOCIETE FRANCAISE DE DEVELOPPEMENT THERMIQUE";
      case 0x0d84:
        return "Testo SE & Co. KGaA";
      case 0x0d85:
        return "SEW-EURODRIVE GmbH & Co KG";
      case 0x0d86:
        return "ROCKWELL AUTOMATION, INC.";
      case 0x0d87:
        return "Quectel Wireless Solutions Co., Ltd.";
      case 0x0d88:
        return "Geocene Inc.";
      case 0x0d89:
        return "Nanohex Corp";
      case 0x0d8a:
        return "Simply Embedded Inc.";
      case 0x0d8b:
        return "Software Development, LLC";
      case 0x0d8c:
        return "Ultimea Technology (Shenzhen) Limited";
      case 0x0d8d:
        return "RF Electronics Limited";
      case 0x0d8e:
        return "Optivolt Labs, Inc.";
      case 0x0d8f:
        return "Canon Electronics Inc.";
      case 0x0d90:
        return "LAAS ApS";
      case 0x0d91:
        return "Beamex Oy Ab";
      case 0x0d92:
        return "TACHIKAWA CORPORATION";
      case 0x0d93:
        return "HagerEnergy GmbH";
      case 0x0d94:
        return "Shrooly Inc";
      case 0x0d95:
        return "Hunter Industries Incorporated";
      case 0x0d96:
        return "NEOKOHM SISTEMAS ELETRONICOS LTDA";
      case 0x0d97:
        return "Zhejiang Huanfu Technology Co., LTD";
      case 0x0d98:
        return "E.F. Johnson Company";
      case 0x0d99:
        return "Caire Inc.";
      case 0x0d9a:
        return "Yeasound (Xiamen) Hearing Technology Co., Ltd";
      case 0x0d9b:
        return "Boxyz, Inc.";
      case 0x0d9c:
        return "Skytech Creations Limited";
      case 0x0d9d:
        return "Cear, Inc.";
      case 0x0d9e:
        return "Impulse Wellness LLC";
      case 0x0d9f:
        return "MML US, Inc";
      case 0x0da0:
        return "SICK AG";
      case 0x0da1:
        return "Fen Systems Ltd.";
      case 0x0da2:
        return "KIWI.KI GmbH";
      case 0x0da3:
        return "Airgraft Inc.";
      case 0x0da4:
        return "HP Tuners";
      case 0x0da5:
        return "PIXELA CORPORATION";
      case 0x0da6:
        return "Generac Corporation";
      case 0x0da7:
        return "Novoferm tormatic GmbH";
      case 0x0da8:
        return "Airwallet ApS";
      case 0x0da9:
        return "Inventronics GmbH";
      case 0x0daa:
        return "Shenzhen EBELONG Technology Co., Ltd.";
      case 0x0dab:
        return "Efento";
      case 0x0dac:
        return "ITALTRACTOR ITM S.P.A.";
      case 0x0dad:
        return "linktop";
      case 0x0dae:
        return "TITUM AUDIO, INC.";
      case 0x0daf:
        return "Hexagon Aura Reality AG";
      case 0x0db0:
        return "Invisalert Solutions, Inc.";
      case 0x0db1:
        return "TELE System Communications Pte. Ltd.";
      case 0x0db2:
        return "Whirlpool";
      case 0x0db3:
        return "SHENZHEN REFLYING ELECTRONIC CO., LTD";
      case 0x0db4:
        return "Franklin Control Systems";
      case 0x0db5:
        return "Djup AB";
      case 0x0db6:
        return "SAFEGUARD EQUIPMENT, INC.";
      case 0x0db7:
        return "Morningstar Corporation";
      case 0x0db8:
        return "Shenzhen Chuangyuan Digital Technology Co., Ltd";
      case 0x0db9:
        return "CompanyDeep Ltd";
      case 0x0dba:
        return "Veo Technologies ApS";
      case 0x0dbb:
        return "Nexis Link Technology Co., Ltd.";
      case 0x0dbc:
        return "Felion Technologies Company Limited";
      case 0x0dbd:
        return "MAATEL";
      case 0x0dbe:
        return "HELLA GmbH & Co. KGaA";
      case 0x0dbf:
        return "HWM-Water Limited";
      case 0x0dc0:
        return "Shenzhen Jahport Electronic Technology Co., Ltd.";
      case 0x0dc1:
        return "NACHI-FUJIKOSHI CORP.";
      case 0x0dc2:
        return "Cirrus Research plc";
      case 0x0dc3:
        return "GEARBAC TECHNOLOGIES INC.";
      case 0x0dc4:
        return "Hangzhou NationalChip Science & Technology Co.,Ltd";
      case 0x0dc5:
        return "DHL";
      case 0x0dc6:
        return "Levita";
      case 0x0dc7:
        return "MORNINGSTAR FX PTE. LTD.";
      case 0x0dc8:
        return "ETO GRUPPE TECHNOLOGIES GmbH";
      case 0x0dc9:
        return "farmunited GmbH";
      case 0x0dca:
        return "Aptener Mechatronics Private Limited";
      case 0x0dcb:
        return "GEOPH, LLC";
      case 0x0dcc:
        return "Trotec GmbH";
      case 0x0dcd:
        return "Astra LED AG";
      case 0x0dce:
        return "NOVAFON - Electromedical devices limited liability company";
      case 0x0dcf:
        return "KUBU SMART LIMITED";
      case 0x0dd0:
        return "ESNAH";
      case 0x0dd1:
        return "OrangeMicro Limited";
      case 0x0dd2:
        return "Sitecom Europe B.V.";
      case 0x0dd3:
        return "Global Satellite Engineering";
      case 0x0dd4:
        return "KOQOON GmbH & Co.KG";
      case 0x0dd5:
        return "BEEPINGS";
      case 0x0dd6:
        return "MODULAR MEDICAL, INC.";
      case 0x0dd7:
        return "Xiant Technologies, Inc.";
      case 0x0dd8:
        return "Granchip IoT Technology (Guangzhou) Co.,Ltd";
      case 0x0dd9:
        return "SCHELL GmbH & Co. KG";
      case 0x0dda:
        return "Minebea Intec GmbH";
      case 0x0ddb:
        return "KAGA FEI Co., Ltd.";
      case 0x0ddc:
        return "AUTHOR-ALARM, razvoj in prodaja avtomobilskih sistemov proti kraji, d.o.o.";
      case 0x0ddd:
        return "Tozoa LLC";
      case 0x0dde:
        return "SHENZHEN DNS INDUSTRIES CO., LTD.";
      case 0x0ddf:
        return "Shenzhen Lunci Technology Co., Ltd";
      case 0x0de0:
        return "KNOG PTY. LTD.";
      case 0x0de1:
        return "Outshiny India Private Limited";
      case 0x0de2:
        return "TAMADIC Co., Ltd.";
      case 0x0de3:
        return "Shenzhen MODSEMI Co., Ltd";
      case 0x0de4:
        return "EMBEINT INC";
      case 0x0de5:
        return "Ehong Technology Co.,Ltd";
      case 0x0de6:
        return "DEXATEK Technology LTD";
      case 0x0de7:
        return "Dendro Technologies, Inc.";
      case 0x0de8:
        return "Vivint, Inc.";
      case 0x0de9:
        return "General Laser GmbH";
      case 0x0dea:
        return "Kathrein Solutions GmbH";
      case 0x0deb:
        return "Fitz Inc.";
      case 0x0dec:
        return "ATEGENOS PHARMACEUTICALS INC";
      case 0x0ded:
        return "Flextronic GmbH";
      case 0x0dee:
        return "Safety Swim LLC";
      case 0x0def:
        return "SING SUN TECHNOLOGY (INTERNATIONAL) LIMITED";
      case 0x0df0:
        return "Woncan (Hong Kong) Limited";
      case 0x0df1:
        return "iFLYTEK (Suzhou) Technology Co., Ltd.";
      case 0x0df2:
        return "Weber-Stephen Products LLC";
      case 0x0df3:
        return "hDrop Technologies Inc.";
      case 0x0df4:
        return "REEKON TOOLS INC.";
      case 0x0df5:
        return "Delta Faucet Company";
      case 0x0df6:
        return "Mutrack Co., Ltd";
      case 0x0df7:
        return "Hangzhou Zhaotong Microelectronics Co., Ltd.";
      case 0x0df8:
        return "Chengdu CSCT Microelectronics Co., Ltd.";
      case 0x0df9:
        return "Belusun Technology Ltd.";
      case 0x0dfa:
        return "Shenzhen Matches IoT Technology Co., Ltd.";
      case 0x0dfb:
        return "Beidou Intelligent Connected Vehicle Technology Co., Ltd.";
      case 0x0dfc:
        return "SOJI ELECTRONICS JOINT STOCK COMPANY";
      case 0x0dfd:
        return "BH Technologies";
      case 0x0dfe:
        return "Haptech, Inc.";
      case 0x0dff:
        return "WaveRF, Corp.";
      case 0x0e00:
        return "SHENZHEN SOUNDSOUL INFORMATION TECHNOLOGY CO.,LTD";
      case 0x0e01:
        return "Wuhu Mengbo Technology Co., Ltd.";
      // Last update date: 08.26.2024

      case 0xffff:
        return "Unassigned";
      default:
        return undefined;
    }
  }
}
