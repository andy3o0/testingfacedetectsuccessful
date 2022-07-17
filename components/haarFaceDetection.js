import cv from "@techstark/opencv-js";
import { createCanvas, loadImage } from "canvas";
import { loadDataFile } from "./cvDataFile";

const msize = new cv.Size(0, 0);
let faceCascade;

export async function loadHaarFaceModels() {
  console.log("=======start downloading Haar-cascade models=======");
  return loadDataFile(
    "haarcascade_frontalface_default.xml",
    "models/haarcascade_frontalface_default.xml"
  )
    .then(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            // load pre-trained classifiers
            faceCascade = new cv.CascadeClassifier();
            faceCascade.load("haarcascade_frontalface_default.xml");
            resolve();
          }, 2000);
        })
    )
    .then(() => {
      console.log("=======downloaded Haar-cascade models=======");
    })
    .catch((error) => {
      console.error(error);
    });
}
/////////////////////////////////////////////////////////////////////////////////////////
export const detectHaarFace = async (img) => {
  var image = img;
  // var name = "output.jpg";
  // var type = "image/jpeg";
  // var quality = 0.95;
  var factor = 1;
  if (image != null) var src = cv.imread(image);
  // console.log(src);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  const faces = new cv.RectVector();
  // detect faces
  faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
  let point1, point2;

  for (let i = 0; i < faces.size(); ++i) {
    point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
    point2 = new cv.Point(
      faces.get(i).x + faces.get(i).width,
      faces.get(i).y + faces.get(i).height
    );

    //get offset pixels from factor, width=height
    let offset = Math.floor(faces.get(i).width * (factor - 1));

    // console.log([point1,point2]);
    // console.log("offset set to"+offset);

    if (point1.x < offset) {
      offset = point1.x;
      // console.log("offset adjusted to "+offset);
    }

    if (point1.y < offset) {
      offset = point1.y;
      // console.log("offset adjusted to "+offset);
    }

    if (image.height < point2.y + offset) {
      offset = image.height - point2.y;
      // console.log("offset2 adjusted to "+offset);
    }

    if (image.width < point2.x + offset) {
      offset = image.width - point2.x;
      // console.log("offset2 adjusted to "+offset);
    }

    point1.x = point1.x - offset;
    point1.y = point1.y - offset;

    point2.x = point2.x + offset;
    point2.y = point2.y + offset;

    // console.log([point1,point2]);
    // console.log(point1.x, point1.y, point2.x, point2.y);

    var canvas = createCanvas(point2.x - point1.x, point2.y - point1.y);

    // 122 52 223 153

    let rect = new cv.Rect(
      point1.x,
      point1.y,
      point2.x - point1.x,
      point2.y - point1.y
    );

    // console.log("Rendering output image...");
    var dst = src.roi(rect);
    // console.log(dst);
    // cv.imshow(canvas, dst);
  }

  // faceCascade.delete();
  gray.delete();
  faces.delete();

  return { dst, canvas };
};
