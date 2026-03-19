import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle, Quote, Lock, ShieldCheck, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const InteractiveDemo = lazy(() => import('./components/InteractiveDemo'));

function LazyLoad({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Reduced margin so it loads closer to scrolling into view
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="min-h-[400px]">{isVisible ? children : null}</div>;
}

const TESTIMONIALS = [
  { quote: "I've been using this around 2 months and it has really improves my consistency. The charts are the best part — I need to see my progress data visually and really it encourages me to continue with the streak. Worth every penny. I highly recommend it.", author: "Ananya Iyer" },
  { quote: "I've tried Notion templates, Habitica, and paper journals—nothing stuck longer than 1 weeks. This one is different because it's already where I work. I open dashboard, I see my tracker, and I fill it in. That's it. Currently on day 47 🙂", author: "Ram Pandit" },
  { quote: "Okay, so I was FULLY skeptical because I already have 3 habit apps that I never open lol. But this one lives in my Google Sheet, so I just see it every time I open my dashboard, and somehow that makes all the difference?? been consistent for 6 weeks, which is literally a record for me.", author: "Raj Patel" },
  { quote: "Honestly didn't expect much for the price. Set it up in maybe 5 minutes, and it's been running for 3 months now. The weekly chart thing is so motivating — I hate seeing a bad week, so I just... don't have them anymore. Simple as that.", author: "Rahul Singh" },
  { quote: "I decided to give this a try and it's probably the best purchase I've made this year. No annoying push notifications, no subscriptions. Just a clean, satisfying checklist that actually keeps me accountable.", author: "Vikram S." },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8 * 3600 + 44 * 60 + 13);
  const showCheckoutModal = location.pathname === '/user-details';
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (showCheckoutModal) {
      loadRazorpay();
    }
  }, [showCheckoutModal]);

  const validateAndPay = async () => {
    let isValid = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (isValid) {
      setIsProcessing(true);
      await handlePayment();
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    navigate('/checkout');
    
    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      navigate('/');
      return;
    }

    const options = {
      key: 'rzp_live_SPRufu2D9yjTyr',
      amount: 9900, // amount in paise (99 INR)
      currency: 'INR',
      name: 'Habit Tracker',
      description: 'Ultimate Habit Tracker',
      image: '/hero.webp',
      handler: function (response: any) {
        // Push purchase event to Data Layer
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({
          event: 'purchase_success',
          ecommerce: {
            currency: options.currency,
            value: options.amount / 100 // Convert paise back to INR
          }
        });
        (window as any).dataLayer = dataLayer;
        
        navigate('/thank-you');
      },
      prefill: {
        name: '',
        email: email,
        contact: phone
      },
      theme: {
        color: '#6b21a8' // brand-purple
      },
      modal: {
        ondismiss: function() {
          navigate('/');
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const faqs = [
    { question: 'Is this a one-time payment?', answer: 'Yes. You pay once and own it forever. No monthly fees.' },
    { question: 'Does this work on mobile?', answer: 'Yes, it works perfectly with the free Google Sheets app on iOS and Android.' },
    { question: 'How do I get access after purchasing?', answer: 'Right after you complete your purchase, you\'ll get instant access to a link. Just click it, make a copy to your own Google Drive, and you\'re ready to start tracking right away!' },
    { question: 'Can I customize the habits?', answer: 'Absolutely. The sheet is fully editable. You can add up to 20 habits and change them anytime.' },
    { question: 'What if I don\'t know how to use Google Sheets?', answer: 'Don\'t worry, you don\'t need to be a spreadsheet expert! It\'s designed to be super intuitive—just click the checkboxes and your dashboard updates automatically. Plus, we include a quick guide to help you get started.' },
  ];

  if (location.pathname === '/thank-you') {
    return (
      <div className="antialiased gradient-bg min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 md:p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-purple mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md">
            Thank you for your purchase. You can now access your Ultimate Habit Tracker Google Sheet.
          </p>
          <a 
            href="https://drive.google.com/file/d/1f1qLIUYbwX1t_Q9__UkYRN1iZIAHLEyh/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-purple px-8 py-4 rounded-full text-lg font-bold shadow-xl w-full md:w-auto text-center"
          >
            Access Google Sheet Now
          </a>
          <p className="text-sm text-gray-500 mt-6">
            Please make a copy of the sheet to your own Google Drive to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased gradient-bg min-h-screen">
      <div className="fixed top-0 w-full z-[60] h-[48px] bg-red-600 text-white flex items-center justify-center text-[12px] sm:text-[14px] px-2 md:px-4 font-medium shadow-md overflow-hidden">
        <div className="flex items-center justify-center whitespace-nowrap">
          <span>⚡ 24-Hour Sale Live Now —</span>
          <span className="line-through opacity-80 mx-1.5">₹199</span>
          <span className="font-extrabold text-[18px] sm:text-[20px] mx-1.5">₹99</span>
          <span className="hidden sm:inline">Grab it before it's gone!</span>
          <span className="ml-2 sm:ml-3 font-mono font-bold bg-black/20 px-2 py-0.5 rounded tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <nav className="absolute top-[48px] w-full z-50 px-4 md:px-6 py-4 flex justify-between items-center glass-card border-b border-gray-100">
        <div className="text-lg md:text-xl font-bold tracking-tighter text-brand-purple">TRACKKER.</div>
        <button onClick={() => navigate('/user-details')} className="bg-brand-purple text-white px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
          Buy Now
        </button>
      </nav>

      <header className="pt-32 md:pt-44 pb-10 md:pb-12 px-0 md:px-6 flex flex-col items-center w-full overflow-hidden">
        <div className="px-6 md:px-0 flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-10"
          >
            <motion.button 
              animate={{ 
                y: [0, -6, 0],
                boxShadow: [
                  "0px 4px 20px rgba(0,0,0,0.05)", 
                  "0px 12px 25px rgba(236,72,153,0.15)", 
                  "0px 4px 20px rgba(0,0,0,0.05)"
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({ event: 'try_demo_clicked' });
                }
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative group p-[1.5px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
            >
              {/* Spinning Gradient Border */}
              <div className="absolute w-[400%] h-[400%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_200deg,#ec4899_280deg,#8b5cf6_360deg)] opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Inner White Pill */}
              <div className="relative bg-white px-6 md:px-8 py-3 md:py-3.5 rounded-full flex items-center justify-center gap-1.5 w-full h-full">
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-slate-500">
                  TRY <span className="text-pink-500">INTERACTIVE</span> DEMO
                </span>
                <span className="text-pink-500 ml-1 group-hover:translate-y-0.5 transition-transform duration-300">↓</span>
              </div>
            </motion.button>
          </motion.div>
          
          <h1 
            className="font-extrabold text-5xl sm:text-6xl md:text-[96px] text-center leading-[0.9] mb-6 tracking-tight text-gray-900 uppercase"
          >
            HABIT <br /> TRACKER
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative inline-block mb-10 md:mb-12"
          >
            <h2 className="font-serif text-xl sm:text-3xl md:text-5xl italic text-gray-400 relative z-10 whitespace-nowrap">
              Build consistency in just <span className="text-black">30 days</span>
            </h2>
            <div className="absolute bottom-1 left-0 w-full h-2 md:h-4 bg-indigo-50/60 rounded-full"></div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xs md:max-w-md text-center text-gray-500 text-base md:text-xl mb-10 md:mb-12 leading-relaxed"
          >
            The <span className="font-semibold text-gray-800">automated habit system</span> that turns your goals into <span className="font-semibold text-gray-800">measurable progress.</span>
          </motion.p>
        </div>

        <div 
          className="relative w-full max-w-4xl mx-auto mb-6 px-2 md:px-4"
        >
          <div className="bg-gray-50 p-1.5 md:p-4 rounded-2xl md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden">
            <img 
              src="/hero.webp" 
              alt="Habit Tracker Dashboard Preview" 
              className="rounded-xl md:rounded-[1.8rem] w-full h-auto block" 
              fetchPriority="high"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        {/* Social Proof Bar */}
        <div className="flex justify-center mt-6 mb-10 px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-sm">
            
            {/* Avatars & Text */}
            <div className="flex items-center gap-3">
              <div className="flex items-center shrink-0">
                {[
                  "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=64&h=64&auto=format&fit=crop", // Indian man
                  "https://images.unsplash.com/photo-1589317621382-0cbef7ffcc4c?q=80&w=64&h=64&auto=format&fit=crop", // Indian woman
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=64&h=64&auto=format&fit=crop", // Indian man
                  "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=64&h=64&auto=format&fit=crop", // Indian woman
                  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=64&h=64&auto=format&fit=crop"  // Indian man
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Indian User"
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-[#FAF9F6] object-cover shadow-sm ${i > 0 ? '-ml-3' : ''}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-poppins font-bold text-[14px] md:text-[15px] text-[#1A1A1A]">1,384+</span>
                <span className="font-poppins text-[13px] md:text-[14px] text-[#666666]">building consistency</span>
              </div>
            </div>

            {/* Subtle Dot Divider */}
            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></div>

            {/* Stars & Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="font-poppins font-medium text-[13px] md:text-[14px] text-[#666666]">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Premium Trust Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full flex flex-col items-center mb-6 px-4"
        >
          <button 
            onClick={() => navigate('/user-details')} 
            className="group relative inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-b from-white to-purple-50/50 text-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(149,76,233,0.15)] border border-purple-200 hover:shadow-[0_8px_25px_rgba(149,76,233,0.2)] hover:border-purple-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_10px_rgba(149,76,233,0.15)] transition-all duration-300"
          >
            <span className="whitespace-nowrap z-10">⚡ Get Instant Access</span>
            
            <div className="w-[1px] h-4 bg-slate-200 z-10 ml-0.5"></div>
            
            <div className="flex items-center gap-1 z-10">
              <span className="text-purple-700 font-extrabold text-base sm:text-lg">₹99</span>
              <span className="line-through text-slate-400 text-xs font-medium">₹199</span>
            </div>

            <div className="bg-emerald-50 text-emerald-600 text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide z-10 border border-emerald-100 ml-0.5">
              SAVE 50%
            </div>
          </button>

          {/* Micro-copy */}
          <div className="mt-5 mb-6 flex items-center justify-center gap-1.5 text-[12px] text-slate-500 font-medium">
            <Lock size={12} className="text-slate-400" />
            <span>Secure 1-click checkout via Razorpay</span>
          </div>

          {/* Checkmarks */}
          <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3 w-full max-w-[500px] text-[12px] font-medium text-slate-600">
            <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> One-time purchase</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> No subscriptions</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Editable anytime</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Lifetime access</div>
          </div>
        </motion.div>
      </header>

      <section className="pt-4 pb-10 md:pt-6 md:pb-16 px-4 md:px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Try it yourself</h2>
            <p className="text-gray-500 mb-6 px-4">Experience the dopamine hit of a completed task.</p>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-5 py-2.5 rounded-full font-bold text-xs md:text-sm shadow-sm animate-bounce">
              <span>👇</span> Click the checkboxes below!
            </div>
          </div>
          
          <div id="demo" className="relative">
            <div className="md:hidden absolute -top-8 right-0 flex items-center gap-1 text-[10px] font-bold text-purple-400 animate-pulse">
              Swipe to explore <Plus size={12} />
            </div>
            <LazyLoad>
              <Suspense fallback={
                <div className="w-full h-[400px] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Interactive Dashboard...</p>
                  </div>
                </div>
              }>
                <InteractiveDemo />
              </Suspense>
            </LazyLoad>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 max-w-[380px] mx-auto flex flex-col items-center relative overflow-hidden"
        >
          {/* Subtle top highlight for a premium "glass" edge feel */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-50"></div>
          
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Flash Sale Ends Soon
          </div>
          
          <h3 className="font-serif text-2xl md:text-[28px] mb-6 text-slate-800 leading-tight relative z-10">
            Buy the system for <br />
            the future <span className="italic text-slate-400 font-light">you.</span>
          </h3>
          
          <button 
            onClick={() => navigate('/user-details')} 
            className="bg-gradient-to-r from-[#2A0845] to-[#6441A5] hover:from-[#1A052B] hover:to-[#4A2E7A] text-white px-5 py-3.5 rounded-2xl text-sm md:text-base font-bold w-full flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(100,65,165,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group z-10"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
            <div className="flex items-center gap-2">
              <span>⚡ Get Instant Access</span>
              <span className="text-white/50 font-normal">|</span>
              <div className="flex items-center gap-1.5">
                <span>₹99</span>
                <span className="line-through text-white/50 text-xs font-medium">₹199</span>
              </div>
            </div>
          </button>
          
          {/* Trust Badges */}
          <div className="mt-5 flex flex-col gap-2 w-full">
            <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Secure Razorpay Checkout</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-500">
              <Lock size={14} className="text-slate-400" />
              <span>Instant Google Drive Delivery</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="pt-16 md:pt-24 px-6 max-w-2xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl text-center mb-10 md:mb-16 leading-tight"
        >
          Why staying consistent <br className="hidden md:block" /> feels impossible?
        </motion.h2>
        
        <div className="space-y-3 md:space-y-4">
          {[
            "You start strong, then miss one day",
            "Tracking stops, motivation fades",
            "Progress disappears, habits feel pointless"
          ].map((text, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-5"
            >
              <span className="bg-red-50 text-red-400 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shrink-0">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </span>
              <p className="font-medium text-gray-600 text-sm md:text-base">{text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 text-center italic text-gray-500 border-l-4 border-purple-100 pl-8 py-4 mx-auto max-w-md"
        >
          "You do not rise to the level of your goals. You fall to the level of your systems."
          <br /> <span className="text-[10px] font-bold not-italic mt-4 block uppercase tracking-[0.2em] text-gray-400">— James Clear, Atomic Habits</span>
        </motion.div>
      </section>

      {/* Gradient Transition */}
      <div className="w-full h-24 md:h-32 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>

      <section id="testimonials" className="pb-12 md:pb-16 bg-white text-gray-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-4xl text-center mb-16">What our users say</h2>
          
          <div className="relative h-[380px] sm:h-[300px] md:h-[280px] lg:h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 1000, damping: 50, mass: 0.5 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -50 || velocity.x < -500) {
                    nextTestimonial();
                  } else if (offset.x > 50 || velocity.x > 500) {
                    prevTestimonial();
                  }
                }}
                className="absolute w-full bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-left cursor-grab active:cursor-grabbing flex flex-col justify-center h-full"
              >
                <Quote className="w-8 h-8 text-purple-200 mb-4" />
                
                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 flex-grow">
                  {TESTIMONIALS[currentTestimonial].quote}
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base md:text-lg shrink-0">
                    {TESTIMONIALS[currentTestimonial].author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 text-sm md:text-base">{TESTIMONIALS[currentTestimonial].author}</span>
                      <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-500">Verified Buyer</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button 
              onClick={prevTestimonial}
              className="hidden md:flex absolute left-0 -ml-4 md:-ml-12 p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-sm transition-colors z-10 items-center justify-center"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextTestimonial}
              className="hidden md:flex absolute right-0 -mr-4 md:-mr-12 p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-sm transition-colors z-10 items-center justify-center"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTestimonial === i ? 'bg-purple-600 w-6' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="pt-16 md:pt-24 pb-4 px-6 max-w-2xl mx-auto relative">
        {/* Gradient Transition */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-32 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 font-serif text-4xl md:text-5xl text-center mb-12 md:mb-16"
        >
          Frequently Asked <br /> Questions
        </motion.h2>
        
        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border-b border-gray-100 cursor-pointer py-4 md:py-5" 
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="font-semibold text-gray-800 text-base md:text-lg">{faq.question}</h4>
                <span className={`text-xl text-gray-400 transition-transform duration-300 shrink-0 ${activeFaq === i ? 'rotate-45 text-purple-600' : ''}`}>
                  <Plus size={20} />
                </span>
              </div>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-gray-600 text-sm md:text-base pt-3 pb-1 leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section id="cta-section" className="pt-4 pb-12 px-4 md:px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[340px] md:max-w-md mx-auto bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(107,33,168,0.15)] border border-purple-100/50 flex flex-col items-center relative overflow-hidden"
        >
          {/* Subtle top highlight for a premium "glass" edge feel */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
          
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent pointer-events-none"></div>

          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-5 relative z-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Final Chance: Sale Ends Soon
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-slate-900 leading-tight relative z-10">
            Start your journey <br />
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 font-light">today.</span>
          </h2>
          
          <button 
            onClick={() => navigate('/user-details')} 
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-5 py-3 md:py-3.5 rounded-2xl text-sm md:text-base font-bold w-full flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(107,33,168,0.25)] transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group z-10"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
            <div className="flex items-center justify-center gap-2">
              <span className="whitespace-nowrap">⚡ Get Instant Access</span>
              <span className="text-white/40 font-normal">|</span>
              <div className="flex items-center gap-1.5">
                <span>₹99</span>
                <span className="line-through text-white/60 text-xs font-medium">₹199</span>
              </div>
            </div>
          </button>
          
          {/* Trust Badges */}
          <div className="mt-5 flex flex-row flex-wrap items-center justify-center gap-3 md:gap-4 w-full relative z-10">
            <div className="flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <Lock size={12} className="text-slate-400" />
              <span>Instant Delivery</span>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 px-4 text-center text-gray-400 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-gray-500 font-bold">
          <button onClick={() => setShowContact(true)} className="hover:text-purple-900 uppercase tracking-[0.2em] md:tracking-[0.4em]">Contact Us</button>
          <button onClick={() => setShowTerms(true)} className="hover:text-purple-900 uppercase tracking-[0.2em] md:tracking-[0.4em]">Terms and Conditions</button>
          <button onClick={() => setShowPrivacy(true)} className="hover:text-purple-900 uppercase tracking-[0.2em] md:tracking-[0.4em]">Privacy Policy</button>
        </div>
        © 2026 TRACKKER BY METRICMINT • ALL RIGHTS RESERVED
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {(showTerms || showPrivacy || showContact) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowTerms(false); setShowPrivacy(false); setShowContact(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  {showTerms ? 'Terms and Conditions' : showPrivacy ? 'Privacy Policy' : 'Contact Us'}
                </h3>
                <button 
                  onClick={() => { setShowTerms(false); setShowPrivacy(false); setShowContact(false); }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-gray-600 text-sm leading-relaxed space-y-4">
                {showTerms ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Last updated: January 2026</p>
                    <p>Please read these Terms and Conditions carefully before purchasing or downloading any product from MetricMint. By completing a purchase, you confirm that you have read, understood, and agree to be bound by these terms.</p>
                    
                    <h4 className="font-bold text-gray-900 mt-6 text-base">1. Introduction</h4>
                    <p>Welcome to MetricMint. These Terms and Conditions govern your purchase and use of the Ultimate Habit Tracker and any other digital products sold through our store. By completing a purchase, you agree to these terms in full.</p>
                    
                    <h4 className="font-bold text-gray-900 mt-6 text-base">2. License and Use</h4>
                    <p>When you purchase the Ultimate Habit Tracker, you are granted a non-exclusive, non-transferable license to use the product for personal, non-commercial purposes only.</p>
                    <ul className="list-none space-y-2 mt-2">
                      <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> You MAY use the spreadsheet for your own personal habit tracking.</li>
                      <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> You MAY make a personal backup copy of the file for your own use.</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> You MAY NOT resell, redistribute, or share the file with others.</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> You MAY NOT claim ownership of the design or structure of the spreadsheet.</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> You MAY NOT use the product as a basis for a competing commercial product.</li>
                    </ul>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">3. Intellectual Property</h4>
                    <p>All content, designs, templates, and assets included in the Ultimate Habit Tracker are the exclusive intellectual property of MetricMint. All rights are reserved. Unauthorized reproduction, modification, distribution, or commercial use of any part of our products is strictly prohibited and may result in legal action.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">4. Refunds and Returns</h4>
                    <p>Due to the instant-access nature of digital goods, all sales are final once the file has been delivered. We do not offer refunds after download. However, if you experience a technical issue that prevents you from accessing your purchase, please contact us at MetricMint1@gmail.com and we will do our best to make it right.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">5. Limitation of Liability</h4>
                    <p>MetricMint's products are provided "as is" without warranty of any kind. We are not liable for any data loss, damages, or issues arising from the use of our spreadsheets. It is your responsibility to maintain backups of your personal data. Our total liability in any circumstances shall not exceed the amount you paid for the product.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">6. Changes to These Terms</h4>
                    <p>We reserve the right to update or modify these Terms and Conditions at any time. Any changes will be posted on our store with an updated effective date. Continued use of our products after such changes constitutes your acceptance of the new terms.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">7. Contact Us</h4>
                    <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                    <p className="font-medium text-purple-900">MetricMint1@gmail.com</p>
                    
                    <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100 flex justify-between">
                      <span>MetricMint · Trackker</span>
                      <span>metricmint1@gmail.com</span>
                    </div>
                  </div>
                ) : showPrivacy ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Last updated: January 2026</p>
                    <p>At MetricMint, we respect your privacy and are committed to being transparent about how we handle your information. This Privacy Policy explains what data we collect, how we use it, and your rights in relation to it.</p>
                    
                    <h4 className="font-bold text-gray-900 mt-6 text-base">1. Information We Collect</h4>
                    <p>We collect information you provide directly to us when you make a purchase, such as your name and email address. We do not store your payment information on our servers; payments are processed securely by our trusted third-party payment processors.</p>
                    
                    <h4 className="font-bold text-gray-900 mt-6 text-base">2. How We Use Your Information</h4>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Process your transactions and deliver your digital product.</li>
                      <li>Send you transaction receipts and download links.</li>
                      <li>Respond to your comments, questions, and customer service requests.</li>
                      <li>Send you updates or news about our products (only if you opted in).</li>
                    </ul>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">3. Data Protection</h4>
                    <p>We take reasonable and appropriate measures to help protect information about you from loss, theft, misuse, and unauthorized access. While no system is completely secure, we continuously work to safeguard your personal data.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">4. Cookies</h4>
                    <p>We may use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience. You can instruct your browser to refuse all cookies or to notify you when a cookie is being sent. Please note that some features of our service may not function properly without cookies.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">5. Your Rights</h4>
                    <p>You have the right to access, correct, or request deletion of your personal data at any time. To exercise any of these rights, please contact us using the details below.</p>

                    <h4 className="font-bold text-gray-900 mt-6 text-base">6. Contact Us</h4>
                    <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please don't hesitate to reach out to us:</p>
                    <p className="font-medium text-purple-900">MetricMint1@gmail.com</p>
                    
                    <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100 flex justify-between">
                      <span>MetricMint · Trackker</span>
                      <span>metricmint1@gmail.com</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center py-8">
                    <p className="text-lg text-gray-600 mb-6">We are here to help you on your journey to consistency. Whether you have a question about the tracker, need technical support, or just want to share your progress, we'd love to hear from you.</p>
                    
                    <h4 className="font-bold text-gray-900 mt-8 text-xl">Get in Touch</h4>
                    <p className="mb-4">For fastest support, please email us directly. We aim to respond to all inquiries within 24 hours.</p>
                    
                    <div className="bg-purple-50 p-6 rounded-2xl inline-block mt-4">
                      <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">Support Email</p>
                      <a href="mailto:MetricMint1@gmail.com" className="text-2xl font-bold text-purple-900 hover:text-purple-700 transition-colors">MetricMint1@gmail.com</a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => navigate('/')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-full sm:h-auto sm:max-w-[380px] bg-white sm:rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans sm:min-h-[480px]"
            >
              {/* Header */}
              <div className="bg-[#1A73E8] text-white px-5 pt-4 pb-6">
                <div className="flex justify-between items-center mb-4 text-xs font-medium opacity-90">
                  <span>User Details</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                    <div className="w-4 h-1.5 rounded-full bg-[#00d26a]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/')} className="hover:bg-white/10 p-1 rounded-full transition-colors -ml-1">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-xl font-bold tracking-wide">Habit Tracker</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-8 bg-white flex-grow rounded-t-xl sm:rounded-none -mt-2 relative z-10">
                <div className="relative mt-2">
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full px-3 py-3.5 border ${emailError ? 'border-[#d32f2f]' : 'border-gray-400'} rounded-md focus:outline-none focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] transition-colors peer bg-transparent text-gray-900`}
                    placeholder=" "
                  />
                  <label htmlFor="email-input" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs ${emailError ? 'text-[#d32f2f] peer-focus:text-[#d32f2f]' : 'text-gray-500 peer-focus:text-[#1A73E8]'} cursor-text`}>
                    Email <span className="text-[#d32f2f]">*</span>
                  </label>
                  {emailError && <p className="text-[#d32f2f] text-xs mt-1.5 absolute -bottom-5 left-0">{emailError}</p>}
                </div>

                <div className="relative mt-2">
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`block w-full px-3 py-3.5 border ${phoneError ? 'border-[#d32f2f]' : 'border-gray-400'} rounded-md focus:outline-none focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] transition-colors peer bg-transparent text-gray-900`}
                    placeholder=" "
                  />
                  <label htmlFor="phone-input" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs ${phoneError ? 'text-[#d32f2f] peer-focus:text-[#d32f2f]' : 'text-gray-500 peer-focus:text-[#1A73E8]'} cursor-text`}>
                    Phone <span className="text-[#d32f2f]">*</span>
                  </label>
                  {phoneError && <p className="text-[#d32f2f] text-xs mt-1.5 absolute -bottom-5 left-0">{phoneError}</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-200 bg-white flex justify-between items-center mt-auto">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400 line-through font-medium">₹199</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider">SAVING 50%</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">
                    ₹99<span className="text-sm text-gray-500 font-medium">.00</span>
                  </div>
                </div>
                <button
                  onClick={validateAndPay}
                  disabled={isProcessing}
                  className="bg-black text-white px-6 sm:px-8 py-3.5 rounded-md font-bold hover:bg-gray-900 transition-all duration-300 disabled:opacity-70 flex items-center justify-center min-w-[150px] sm:min-w-[160px]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Proceed to Pay"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
