document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector('.navbar')
  const navbarButton = navbar.querySelector('.cta-button')
  const navLinks = navbar.querySelectorAll('nav a')
  const sections = document.querySelectorAll('main > section[id]')
  const ctaButtons = document.querySelectorAll('main .cta-button')
  const copyDiscordNicknameButton = document.querySelector('.copy-discord-nickname')
  const track = document.querySelector('.testimonials-track')
  const nextButton = document.querySelector('.next-testimonial-button')
  const prevButton = document.querySelector('.previous-testimonial-button')
  const revealCharsElements = document.querySelectorAll('.reveal-chars')
  const revealLinesElements = document.querySelectorAll('.reveal-lines')

  // Navbar logic
  const ctaVisibilityMap = new Map()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      ctaVisibilityMap.set(entry.target, entry.isIntersecting)
    })

    const anyCtaVisible = Array.from(ctaVisibilityMap.values()).some((visible) => visible)

    if (anyCtaVisible) {
      navbarButton.classList.add('is-hidden')
      return
    }
    navbarButton.classList.remove('is-hidden')
  }, { threshold: 0.1 })

  ctaButtons.forEach((ctaButton) => {
    ctaVisibilityMap.set(ctaButton, false)
    observer.observe(ctaButton)
  })

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('id')

      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('active'))

        const activeLink = navbar.querySelector(`nav a[href="#${id}"]`)

        if (activeLink) {
          activeLink.classList.add('active')
        }

        return
      }

      if (id === 'reel') {
        navbar.classList.add('fixed')
      }
    })
  }, {
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0,
  })

  sections.forEach((section) => spyObserver.observe(section))

  window.addEventListener('scroll', () => {
    if (window.scrollY === 0) {
      navbar.classList.remove('fixed')
    }
  }, { passive: true })

  // Testimonials logic
  if (!track || !prevButton || !nextButton) return;

  const scrollCarousel = (direction) => {
    const card = track.querySelector(".testimonial-card");
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const scrollAmount = cardWidth + gap;

    track.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth"
    });
  };

  prevButton.addEventListener("click", () => scrollCarousel("prev"));
  nextButton.addEventListener("click", () => scrollCarousel("next"));

  // Copy Discord nickname
  copyDiscordNicknameButton.addEventListener('click', () => {
    navigator.clipboard.writeText('th0rzfx')
    copyDiscordNicknameButton.classList.add('copied')

    setTimeout(() => {
      copyDiscordNicknameButton.classList.remove('copied')
    }, 2000)
  })

  const workCards = document.querySelectorAll('.work-grid li')

  workCards.forEach((card) => {
    const video = card.querySelector('video')

    let playTimeout = null
    const hoverDelay = 2000

    card.addEventListener('click', () => {
      const isAlreadyPlaying = video.classList.contains('playing')

      if (isAlreadyPlaying) {
        return
      }

      const currentlyPlayingVideo = document.querySelector('.work-grid li video.playing')

      if (currentlyPlayingVideo) {
        currentlyPlayingVideo.classList.remove("playing")
        stopVideo(currentlyPlayingVideo)
      }

      video.classList.add("playing")
      playVideo(video, true)
    })

    card.addEventListener('mouseenter', () => {
      const isAlreadyPlaying = video.classList.contains('playing')

      if (isAlreadyPlaying) {
        return
      }

      playTimeout = setTimeout(() => {
        const isAnotherVideoPlaying = document.querySelector('.work-grid li video.playing')
        const isAnotherVideoNotPaused = !isAnotherVideoPlaying?.paused

        if (isAnotherVideoPlaying && isAnotherVideoNotPaused) {
          return
        }

        playVideo(video)
      }, hoverDelay)
    })

    card.addEventListener('mouseleave', () => {
      clearTimeout(playTimeout);

      if (video.classList.contains('playing')) {
        return
      }

      stopVideo(video)
    })
  })

  function playVideo(video, withControls = false) {
    if (!video.src) {
      video.src = video.dataset.src

      video.addEventListener(
        "loadeddata",
        () => {
          video.controls = withControls
          video.play()
        },
        { once: true },
      )

      video.load()
      return
    }

    video.controls = withControls
    video.play()
  }

  function stopVideo(video) {
    video.pause()
    video.currentTime = 0
    video.load()
    video.controls = false
  }

  // Reveal chars logic
  revealCharsElements.forEach((element) => {
    const htmlContent = element.innerHTML
    const lines = htmlContent.split(/<br\s*[\/]?>/gi)

    let globalCharIndex = 0

    const newHTML = lines.map((line) => {
      const words = line.trim().split(/\s+/)

      const wrappedWords = words.map((word) => {
        if (word === "") {
          return ""
        }

        const letters = word.split('').map((char) => {
          const index = globalCharIndex++

          return `<span class="char-unit" style="--i: ${index};">${char}</span>`
        }).join('')

        return `<span aria-hidden=true class="word-container">${letters}</span>`
      })

      return wrappedWords.join(' ')
    }).join('<br />')

    element.innerHTML = `<span class="sr-only">${htmlContent}</span>` + newHTML
  })
})
