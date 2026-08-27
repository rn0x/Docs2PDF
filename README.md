# Docs2PDF

A desktop application to convert Word, Excel, and PowerPoint files to PDF using [office2pdf](https://github.com/developer0hye/office2pdf).

**[العربية](README-ar.md)**

## Screenshots

| Language Selection | File Selection | Conversion Complete | Settings |
|:---:|:---:|:---:|:---:|
| ![Language](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-53-56.png) | ![Files](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-26.png) | ![Done](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-34.png) | ![Settings](https://raw.githubusercontent.com/rn0x/Docs2PDF/main/screenshot/Screenshot%20From%202026-08-27%2020-54-45.png) |

## Features

- Drag & drop or select files
- Batch conversion
- Multiple paper sizes and orientation
- PDF/A output support
- 16 languages
- Dark/Light theme

## Requirements

- Node.js >= 18
- npm or yarn

## Installation

```bash
git clone https://github.com/rn0x/Docs2PDF.git
cd Docs2PDF
npm install
npm run download:binaries
```

## Development

```bash
npm run electron:dev
```

## Build

```bash
npm run pack:linux    # Linux
npm run pack:win      # Windows
npm run pack:mac      # macOS
```

## How it Works

1. Select or drag files (.docx, .xlsx, .pptx)
2. Choose output folder
3. Click "Convert"
4. Open output folder when done

## Supported Formats

| Input | Output |
|-------|--------|
| .docx | .pdf |
| .xlsx | .pdf |
| .pptx | .pdf |

## License

MIT License