export class StringUtils {
  static diff(s1: string, s2: string, p = 4): string {
    if (!s1 && !s2) {
      return '';
    }
    if (!s1) {
      return '<span class="inserted">' + s2 + '</span>';
    }
    if (!s2) {
      return '<span class="deleted">' + s1 + '</span>';
    }
    s1 = s1.toString();
    s2 = s2.toString();
    const changeData = StringUtils.getChanges(s1, s2, '', p);
    const nextS = s2.slice(
      changeData.mtc.length + changeData.ins.length + changeData.sbs.length
    ); // remaining part of "s"
    const nextThis = s1.slice(
      changeData.mtc.length + changeData.del.length + changeData.sbs.length
    ); // remaining part of "this"
    let result = ''; // the glorious result
    if (changeData.del.length > 0) {
      changeData.del = '<span class="deleted">' + changeData.del + '</span>';
    }
    if (changeData.ins.length > 0) {
      changeData.ins = '<span class="inserted">' + changeData.ins + '</span>';
    }
    result = changeData.mtc + changeData.del + changeData.ins + changeData.sbs;
    result +=
      nextThis !== '' || nextS !== ''
        ? StringUtils.diff(nextThis, nextS, p)
        : '';
    return result;
  }

  private static getMatchingSubstring(s, l, m) {
    // returns the first matching substring in-between the two strings
    let i = 0;
    let match = false;
    const slen = s.length;
    const o = { fis: slen, mtc: m, sbs: '' }; // temporary object used to construct the cd (change data) object

    while (i < slen) {
      l[i] === s[i]
        ? match
          ? (o.sbs += s[i]) // o.sbs holds the matching substring itsef
          : ((match = true), (o.fis = i), (o.sbs = s[i]))
        : match
          ? (i = slen) // stop after the first found substring
          : (i = i);
      ++i;
    }
    return o;
  }

  private static getChanges(s1, s2, m, p) {
    const isThisLonger = s1.length >= s1.length ? true : false;
    let [longer, shorter] = isThisLonger ? [s1, s2] : [s2, s1]; // assignment of longer and shorter by es6 destructuring
    let bi = 0; // base index designating the index of first mismacthing character in both strings

    while (shorter[bi] === longer[bi] && bi < shorter.length) {
      ++bi;
    } // make bi the index of first mismatching character
    longer = longer.split('').slice(bi); // as the longer string will be rotated it is converted into array
    shorter = shorter.slice(bi); // shorter and longer now starts from the first mismatching character

    const len = longer.length; // length of the longer string
    let cd: any = {
      fis: shorter.length, // the index of matching string in the shorter string
      fil: len, // the index of matching string in the longer string
      sbs: '', // the matching substring itself
      mtc: m + s2.slice(0, bi)
    }; // if exists mtc holds the matching string at the front
    let sub: any = { sbs: '' }; // returned substring per 1 character rotation of the longer string

    if (shorter !== '') {
      for (let rc = 0; rc < len && sub.sbs.length < p; rc++) {
        // rc -> rotate count, p -> precision factor
        sub = StringUtils.getMatchingSubstring(
          shorter,
          StringUtils.rotateArray(longer, rc),
          cd.mtc
        ); // rotate longer string 1 char and get substring
        sub.fil =
          rc < len - sub.fis
            ? sub.fis + rc // mismatch is longer than the mismatch in short
            : sub.fis - len + rc; // mismatch is shorter than the mismatch in short
        if (sub.sbs.length > cd.sbs.length) {
          cd = sub; // only keep the one with the longest substring.
        }
      }
    }
    // insert the mismatching delete subsrt and insert substr to the cd object and attach the previous substring
    [cd.del, cd.ins] = isThisLonger
      ? [longer.slice(0, cd.fil).join(''), shorter.slice(0, cd.fis)]
      : [shorter.slice(0, cd.fis), longer.slice(0, cd.fil).join('')];
    return cd.del.indexOf(' ') === -1 ||
      cd.ins.indexOf(' ') === -1 ||
      cd.del === '' ||
      cd.ins === '' ||
      cd.sbs === ''
      ? cd
      : StringUtils.getChanges(cd.del, cd.ins, cd.mtc, p);
  }

  private static rotateArray(array, n) {
    const len = array.length;
    const res = new Array(array.length);
    if (n % len === 0) {
      return array.slice();
    } else {
      for (let i = 0; i < len; i++) {
        res[i] = array[(i + (len + (n % len))) % len];
      }
    }
    return res;
  }

  static isValidNumber(value: string): boolean {
    return !isNaN(Number(value));
  }

  static isOctalNumber(value: string): boolean {
    return StringUtils.isValidNumber(value) && value.startsWith("0") && value.length > 1;
  }
}
