import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8 px-6 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#5A2A6E]/20 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A3D9] to-[#5A2A6E] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">
                            Habit Consequence Simulator
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-sm mb-8">
                        Experience the long-term impact of your daily choices through our immersive consequence simulator.
                        Build a better future, one habit at a time.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">Product</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">Features</Link></li>
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">Pricing</Link></li>
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">Testimonials</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">Company</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">About Us</Link></li>
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">Contact</Link></li>
                        <li><Link href="/" className="hover:text-[#C9A3D9] transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                <p>© 2026 Habit Consequence Simulator. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="/" className="hover:text-white transition-colors">Twitter</Link>
                    <Link href="/" className="hover:text-white transition-colors">LinkedIn</Link>
                    <Link href="/" className="hover:text-white transition-colors">GitHub</Link>
                </div>
            </div>
        </footer>
    );
}
