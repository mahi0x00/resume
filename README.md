# Application Security Engineer Portfolio

A modern, GitHub-themed portfolio website for Application Security Engineers, built with HTML, CSS, and JavaScript. Features dynamic content loading from XML for easy updates.

## Features

- Responsive design that works well on all devices
- GitHub dark theme inspired layout with light/dark mode toggle
- Content stored in XML file for easy editing
- Sections for skills, experience, projects, education, and certifications
- Modern CSS Grid and Flexbox layouts
- Simple JavaScript for smooth scrolling and interactive elements

## How to Customize

1. **Edit the XML Content**
   - The easiest way to update your resume is by editing the `resumeData.xml` file
   - All your personal information, experience, skills, and other sections are stored there
   - Changes to the XML file will automatically update the website when refreshed

2. **Personal Information**
   - Edit `resumeData.xml` in the `<personal>` section to update your name, title, and contact information
   - Replace the profile image URL with your own image

3. **Content Sections**
   - Update each section in the XML file (`<about>`, `<skills>`, `<experience>`, `<tools>`, etc.)
   - Add or remove items in each section as needed

4. **Styling**
   - Customize colors in `css/style.css` by modifying the CSS variables in the `:root` selector
   - Adjust spacing, fonts, or other visual elements as desired

## XML Structure

The `resumeData.xml` file contains all your resume content and is structured as follows:

```xml
<resume>
    <personal>
        <!-- Personal information (name, title, links) -->
    </personal>
    
    <about>
        <!-- About me section -->
    </about>
    
    <skills>
        <!-- Skills categories and items -->
    </skills>
    
    <experience>
        <!-- Work experience entries -->
    </experience>
    
    <projects>
        <!-- Project entries -->
    </projects>
    
    <education>
        <!-- Education entries -->
    </education>
    
    <certifications>
        <!-- Certification entries -->
    </certifications>
    <tools>
        <!-- Tools entries -->
    </tools>
</resume>
```

## Hosting on GitHub Pages

1. **Create a GitHub Repository**
   - Create a new repository on GitHub named `yourusername.github.io` (replace "yourusername" with your actual GitHub username)

2. **Push Your Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "main" branch
   - Click Save

4. **View Your Site**
   - After a few minutes, your site will be available at `https://yourusername.github.io`

## Adding a Custom Domain (Optional)

1. Purchase a domain from a domain registrar (like Namecheap, GoDaddy, etc.)
2. Add a `CNAME` file to your repository containing your domain name
3. Configure your domain's DNS settings:
   - Add an A record pointing to GitHub Pages IP addresses:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or add a CNAME record pointing to `yourusername.github.io`
4. In your repository settings, add your custom domain and enable HTTPS

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Font Awesome for the icons
- GitHub's design for inspiration