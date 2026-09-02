import AppKit

let size = 1024
let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
let ctx = NSGraphicsContext.current!.cgContext

func color(_ hex: UInt32) -> CGColor {
    CGColor(
        red: CGFloat((hex >> 16) & 0xFF) / 255,
        green: CGFloat((hex >> 8) & 0xFF) / 255,
        blue: CGFloat(hex & 0xFF) / 255,
        alpha: 1
    )
}

let s = CGFloat(size)

// Background — brand red with a soft diagonal gradient for depth.
let colors = [color(0xEA3E4B), color(0xC5293A)] as CFArray
let gradient = CGGradient(
    colorsSpace: CGColorSpaceCreateDeviceRGB(),
    colors: colors, locations: [0, 1]
)!
ctx.drawLinearGradient(
    gradient, start: CGPoint(x: 0, y: s), end: CGPoint(x: s, y: 0), options: []
)

let white = color(0xFFFFFF)

// Thin shopping-bag handle — an open loop rising from behind the bag.
ctx.setStrokeColor(white)
ctx.setLineWidth(46)
ctx.setLineCap(.round)
ctx.beginPath()
ctx.addArc(
    center: CGPoint(x: s / 2, y: 590), radius: 132,
    startAngle: .pi, endAngle: 0, clockwise: true
)
ctx.strokePath()

// Bag body — rounded rectangle over the handle base.
let bagWidth: CGFloat = 520
let bagHeight: CGFloat = 440
let bagX = (s - bagWidth) / 2
let bagY: CGFloat = 200
let body = CGPath(
    roundedRect: CGRect(x: bagX, y: bagY, width: bagWidth, height: bagHeight),
    cornerWidth: 96, cornerHeight: 96, transform: nil
)
ctx.addPath(body)
ctx.setFillColor(white)
ctx.fillPath()

// Cut-out "E" on the bag in brand red.
let letter = "E" as NSString
let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center
let attrs: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 330, weight: .black),
    .foregroundColor: NSColor(cgColor: color(0xD62F3D))!,
    .paragraphStyle: paragraph
]
let textSize = letter.size(withAttributes: attrs)
letter.draw(
    at: CGPoint(x: s / 2 - textSize.width / 2, y: bagY + (bagHeight - textSize.height) / 2 + 4),
    withAttributes: attrs
)

NSGraphicsContext.restoreGraphicsState()

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "AppIcon.png"
let data = rep.representation(using: .png, properties: [:])!
try! data.write(to: URL(fileURLWithPath: out))
print("wrote \(out)")
