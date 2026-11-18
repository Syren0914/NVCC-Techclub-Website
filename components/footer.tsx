import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Code } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  <Code className="size-4" />
                </div>
              <span className="font-bold text-xl">TechClub</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              A community of tech enthusiasts learning and building together.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/techclub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com/techclub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="size-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://linkedin.com/company/techclub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="size-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="mailto:techclub@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="size-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/resources/web-development"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/cybersecurity"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/game-development"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Game Development
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/robotics"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Robotics
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/career"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Career Resources
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">
                LC Building, Room 302E
                <br />
                Loudoun Campus
                <br />
                Sterling, VA  20164
              </li>
              <li>
                <Link
                  href="mailto:nvcctechclub@gmail.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  nvcctechclub@gmail.com
                </Link>
              </li>
              <li>
                <Link href="tel:+15551234567" className="text-muted-foreground hover:text-foreground transition-colors">
                  (703) - 994-5970
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TechClub. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/code-of-conduct" className="text-muted-foreground hover:text-foreground transition-colors">
              Code of Conduct
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

