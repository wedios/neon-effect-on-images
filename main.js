const loop = true;
const loadImageButton = document.querySelector("#loadImageButton");
const urlInput = document.querySelector("#urlInput");
const loader = document.querySelector("#loader");
const forms = document.querySelectorAll(".noSubmitForm");
// const pagecontainer = document.querySelector(".container");
const previewContainer = document.querySelector(".previewContainer");

// hide loader
loader.style.display = "none";
let domp = new DOMParser();
// functions
const getSvg = (image) => {
  return new Promise(async (resolve, reject) => {
    loader.style.display = "inline-block";
    let borderPageUrl = `https://api.dev.wedios.co/no-auth/image-border/?url=${image.src}`;
    let borderImageShot = `https://ffmpeg.wedios.co/api/site-shot?access_key=Pr28qGvg6XvbLLeYZbVs9KaYMtNc6mJQP5aq&url=${borderPageUrl}&width=${image.naturalWidth}&height=${image.naturalHeight}&asbase64=yes`;
    let base64Image = await fetch(borderImageShot)
      .then((e) => e.text())
      .finally(() => {
        loader.style.display = "none";
      });

    loader.style.display = "inline-block";
    let whiteBgImage = new Image();
    whiteBgImage.src = base64Image;

    whiteBgImage.addEventListener("load", async (e) => {
      let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");
      canvas.height = whiteBgImage.naturalHeight;
      canvas.width = whiteBgImage.naturalWidth;
      ctx.drawImage(whiteBgImage, 0, 0);

      var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height),
        pix = imgd.data,
        newColor = { r: 0, g: 0, b: 0, a: 0 };

      for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i],
          g = pix[i + 1],
          b = pix[i + 2];

        if (r !== 0 && g !== 0 && b !== 0) {
          // Change the white to the new color.
          pix[i] = newColor.r;
          pix[i + 1] = newColor.g;
          pix[i + 2] = newColor.b;
          pix[i + 3] = newColor.a;
        }
      }

      ctx.putImageData(imgd, 0, 0);

      let dataUrlAlpha = canvas.toDataURL("image/png");
      const blobToUpload = await fetch(dataUrlAlpha).then((e) => e.blob());
      let nnn = "alpha.png";
      let file = new File([blobToUpload], nnn);

      let fd = new FormData();
      fd.append("png", file, nnn);
      let pngToSvg = await fetch(
        `https://ffmpeg.wedios.co/api/png-to-svg?access_key=Pr28qGvg6XvbLLeYZbVs9KaYMtNc6mJQP5aq`,
        {
          method: "post",
          body: fd
        }
      )
        .then((e) => e.json())
        .catch((e) => {
          M.toast({ html: "Something went wrong while getting svg." });
        })
        .finally(() => {
          loader.style.display = "none";
        });
      if (!pngToSvg.s) {
        M.toast({ html: "Something went wrong while getting svg." });
        M.toast({ html: "Something went wrong while getting svg." });
        return;
      }

      let targetSvg = pngToSvg.svg;
      targetSvg = domp.parseFromString(targetSvg, "text/html");
      targetSvg = targetSvg.body.children[0];
      previewContainer.innerHTML = "";
      previewContainer.appendChild(image);
      previewContainer.appendChild(targetSvg);
      let targetPath = targetSvg.querySelector("path");

      targetPath.setAttribute("fill", "transparent");
      targetPath.setAttribute("stroke", "rgb(255,255,128)");
      targetPath.setAttribute("stroke-width", "4px");
      targetPath.setAttribute("filter", "url(#neon)");

      let originalDashLength = targetPath.getTotalLength();
      targetPath.style.strokeDasharray = originalDashLength;
      let dashLength = originalDashLength;
      targetPath.style.strokeDashoffset = dashLength;

      let innterval = setInterval(() => {
        dashLength -= 20;
        targetPath.style.strokeDashoffset = dashLength;
        if (dashLength <= 0) {
          if (loop) {
            dashLength = originalDashLength;
          } else {
            clearInterval(innterval);
          }
        }
      }, 1000 / 29);
    });
  });
};
const applyEffect = (image) => {
  // loader.style.display = "inline-block";
};

// Events
loadImageButton.addEventListener("click", (e) => {
  if (urlInput.value.trim() === "") {
    M.toast({ html: "Enter image url." });
    return;
  }
  let imageTag = new Image();
  imageTag.src = urlInput.value;

  loader.style.display = "inline-block";

  imageTag.addEventListener("load", (e) => {
    loader.style.display = "none";
    getSvg(imageTag).then((svgCode) => {
      applyEffect(svgCode);
    });
  });
  imageTag.addEventListener("error", (e) => {
    loader.style.display = "none";
    M.toast({ html: "Error while loading image." });
    M.toast({ html: "Try again or use different image." });
  });
});

forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
});
