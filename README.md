# 🍽️ FoodBuddy AI

**ผู้ช่วยวางแผนมื้ออาหารอัจฉริยะส่วนตัวของคุณ**

FoodBuddy AI คือแอปพลิเคชันที่ใช้ AI เพื่อช่วยคำนวณแคลอรี่ แนะนำเมนูอาหาร และวางแผนมื้ออาหารเพื่อสุขภาพที่เหมาะสมกับคุณโดยเฉพาะ

## ✨ คุณสมบัติหลัก

- **👤 โปรไฟล์ผู้ใช้ที่ปรับแต่งได้**: ระบุเพศ อายุ ส่วนสูง น้ำหนัก ระดับกิจกรรม เป้าหมาย และข้อจำกัดด้านอาหาร
- **🤖 AI-Powered Recommendations**: ใช้ Google Gemini API เพื่อสร้างคำแนะนำเมนูที่เหมาะสมกับส่วนบุคคล
- **📸 Food Recognition**: ถ่ายรูปอาหารเพื่อรับข้อมูลแคลอรี่และสารอาหาร
- **📊 Meal Planning**: วางแผนมื้ออาหารรายสัปดาห์พร้อมข้อมูลโภคนาการ
- **💬 Chat Assistant**: สนทนากับ AI เพื่อถามคำถามเกี่ยวกับอาหารและสุขภาพ
- **📈 Tracking & History**: ติดตามประวัติมื้ออาหารและความก้าวหน้า
- **🔐 Secure Authentication**: ระบบตรวจสอบสิทธิ์ด้วย Supabase

## 🛠️ เทคโนโลยี

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend & Services
- **Google Generative AI (Gemini)** - AI recommendations
- **Supabase** - Authentication & Database
- **React Markdown** - Content rendering

## 📁 โครงสร้างโปรเจกต์

```
FoodBuddy-AI/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── admin/                    # Admin pages
├── components/                   # React components
│   ├── Auth.tsx                  # Authentication
│   ├── Dashboard.tsx             # Main dashboard
│   ├── CameraView.tsx            # Food recognition
│   ├── ChatAssistant.tsx         # AI chat
│   ├── MealPlanView.tsx          # Weekly meal plans
│   ├── HistoryView.tsx           # Meal history
│   ├── ProfileView.tsx           # User profile
│   ├── MealCard.tsx              # Meal component
│   ├── Home.tsx                  # Home component
│   ├── Onboarding.tsx            # User onboarding
│   └── AdminDashboard.tsx        # Admin panel
├── services/
│   ├── geminiService.ts          # Google Gemini API integration
│   └── supabaseClient.ts         # Supabase client setup
├── utils/
│   ├── calculations.ts           # BMR/TDEE calculations
│   └── supabaseClient.ts         # Database utilities
├── types.ts                      # TypeScript interfaces & enums
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
└── README.md                     # This file
```

## 🚀 การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- npm หรือ yarn
- Google Gemini API key
- Supabase account & credentials

### ขั้นตอนการติดตั้ง

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/FoodBuddy-AI.git
   cd FoodBuddy-AI
   ```

2. **ติดตั้ง dependencies**
   ```bash
   npm install
   ```

3. **สร้างไฟล์ `.env.local`**
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **รัน development server**
   ```bash
   npm run dev
   ```

5. **เปิดเบราว์เซอร์**
   ```
   http://localhost:3000
   ```

## 📦 Scripts

- `npm run dev` - รัน development server
- `npm run build` - Build สำหรับ production
- `npm run start` - รัน production server
- `npm run lint` - ตรวจสอบ code quality

## 💡 วิธีการใช้

### 1. **ลงทะเบียนและสร้างโปรไฟล์**
   - ลงทะเบียนด้วยอีเมล
   - ตอบคำถามเกี่ยวกับตัวเองเพื่อสร้างโปรไฟล์ส่วนบุคคล
   - ระบบจะคำนวณ BMR และ TDEE โดยอัตโนมัติ

### 2. **ใช้ Dashboard หลัก**
   - ดูแคลอรี่และสารอาหารในวันนี้
   - ถ่ายรูปอาหารเพื่อบันทึก
   - รับคำแนะนำจาก AI

### 3. **วางแผนมื้ออาหาร**
   - ขอให้ AI วางแผนมื้ออาหารรายสัปดาห์
   - ปรับแต่งตามความชอบ
   - ติดตามเป้าหมายแคลอรี่

### 4. **สนทนากับ AI**
   - ถามคำถามเกี่ยวกับอาหารและสุขภาพ
   - รับคำแนะนำเฉพาะบุคคล
   - แบ่งปันประวัติมื้ออาหารของคุณ

## 🔑 Key Features Explained

### BMR & TDEE Calculation
- **BMR (Basal Metabolic Rate)**: แคลอรี่ที่ร่างกายใช้ในการพักผ่อน
- **TDEE (Total Daily Energy Expenditure)**: แคลอรี่ทั้งหมดที่ใช้ต่อวัน
- ใช้ Mifflin-St Jeor equation สำหรับการคำนวณที่ถูกต้อง

### Activity Levels
- 🚫 **Sedentary**: ออกกำลังน้อยหรือไม่ออกกำลัง
- 🚶 **Lightly Active**: ออกกำลังเบา 1-3 วัน/สัปดาห์
- 🏃 **Moderately Active**: ออกกำลังปกติ 3-5 วัน/สัปดาห์
- 💪 **Very Active**: ออกกำลังหนัก 6-7 วัน/สัปดาห์
- 🔥 **Super Active**: ออกกำลังหนักมากและงานที่ต้องใช้แรงงาน

### Goals
- 📉 **Lose Weight**: ลดน้ำหนัก (deficit 300-500 cal)
- ⚖️ **Maintain Weight**: รักษาน้ำหนัก (matching TDEE)
- 💪 **Gain Muscle**: เพิ่มกล้ามเนื้อ (surplus 300-500 cal)

## 🔐 ความปลอดภัย

- ✅ Authentication ผ่าน Supabase
- ✅ API keys เก็บใน environment variables
- ✅ Client-side rendering สำหรับ privacy
- ✅ ข้อมูลผู้ใช้เข้ารหัสและปลอดภัย

## 📚 API Integration

### Google Gemini API
- ใช้ `gemini-2.5-flash` model
- Structured output สำหรับ meal recommendations
- Vision API สำหรับ food recognition

### Supabase
- Real-time database
- User authentication
- Row-level security

## 🐛 Troubleshooting

### API Key Issues
- ตรวจสอบให้แน่ใจว่า `.env.local` มี keys ที่ถูกต้อง
- ตรวจสอบ Google Cloud Console สำหรับ Gemini API quota

### Database Connection
- ตรวจสอบ Supabase URL และ keys
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

### Loading Issues
- ล้าง browser cache
- รีเซ็ต Node modules: `rm -rf node_modules && npm install`

## 📝 ตัวอย่างการใช้ API

### ขอคำแนะนำเมนู
```typescript
const recommendations = await getMealRecommendations(userProfile);
```

### วางแผนมื้ออาหารรายสัปดาห์
```typescript
const weeklyPlan = await generateWeeklyMealPlan(userProfile);
```

### วิเคราะห์รูปภาพอาหาร
```typescript
const mealData = await analyzeFoodImage(imageBase64, userProfile);
```

## 🤝 Contributing

เรายินดีต้อนรับการร่วมสนับสนุน! โปรดติดตามขั้นตอนต่อไปนี้:

1. Fork the repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📄 License

โปรเจกต์นี้อยู่ภายใต้ MIT License - ดูไฟล์ `LICENSE` สำหรับรายละเอียด

## 📞 Contact & Support

- 📧 Email: support@foodbuddy-ai.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/FoodBuddy-AI/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/FoodBuddy-AI/wiki)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Recipe suggestions based on available ingredients
- [ ] Integration with fitness trackers
- [ ] Social features & community meal sharing
- [ ] Barcode scanning for packaged foods
- [ ] Offline mode support
- [ ] Multi-language support

---

**Made with ❤️ by the FoodBuddy AI Team**
