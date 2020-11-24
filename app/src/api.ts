

function dataURItoBlob(dataURI : string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1])
  else
    byteString = unescape(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ia], {type:mimeString})
}

class Api {

  static apiAdress : string = ''

  static async postImage(img: string, name: string, digit: number) {
    if (digit < 0 || digit > 9)
      throw new Error('Digit out of range.')
    var data = new FormData()
    data.append('image', dataURItoBlob(img), 'image.bmp')
    await fetch(`${this.apiAdress}/save/${name}/${digit}`, {
      method: 'POST',
      body: data,
      headers: {
        // 'Content-Type': 'multipart/form-data'
      },
    })
  }
  
  static async getNumber(user: string) : Promise<number> {
    let response = await fetch(`${this.apiAdress}/next_number/${user}`, {
      method: 'GET',
      headers: {
        // 'Content-Type': 'multipart/form-data'
      },
    })
    const json = await response.json()
    console.log(json)
    return json['next_number']
  }
}


export { Api }