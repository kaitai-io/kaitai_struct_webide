declare namespace bigInt {
  type NumOrInt = number | bigInt.BigInt; // Private alias for legibility

  /**
   * BigInt
   *
   * Method Chaining
   * Note that bigInt operations return new bigInts, which allows you to chain methods
   */
  export interface BigInt {
    /**
     * abs()
     *
     * Returns the absolute value of a bigInt.
     *
     * - bigInt(-45).abs() => 45
     * - bigInt(45).abs() => 45
     */
    abs(): BigInt;

    /**
     * add(number)
     *
     * Performs addition.
     *
     * - bigInt(5).add(7) => 12
     *
     * @param number
     */
    add(number: NumOrInt): BigInt;

    /**
     * and(number)
     *
     * Performs the bitwise AND operation. The operands are treated as if they were represented using two's complement
     * representation.
     *
     * - bigInt(6).and(3) => 2
     * - bigInt(6).and(-3) => 4
     */
    and(number: NumOrInt): BigInt;

    /**
     * compare(number)
     *
     * Performs a comparison between two numbers. If the numbers are equal, it returns 0. If the first number is
     * greater, it returns 1. If the first number is lesser, it returns -1.
     *
     * - bigInt(5).compare(5) => 0
     * - bigInt(5).compare(4) => 1
     * - bigInt(4).compare(5) => -1
     */
    compare(number: NumOrInt): number;

    /**
     * compareAbs(number)
     *
     * Performs a comparison between the absolute value of two numbers.
     *
     * - bigInt(5).compareAbs(-5) => 0
     * - bigInt(5).compareAbs(4) => 1
     * - bigInt(4).compareAbs(-5) => -1
     */
    compareAbs(number: NumOrInt): number;

    /**
     * compareTo(number)
     *
     * Alias for the compare method.
     */
    compareTo(number: NumOrInt): number;

    /**
     * divide(number)
     *
     * Performs integer division, disregarding the remainder.
     *
     * - bigInt(59).divide(5) => 11
     */
    divide(number: NumOrInt): BigInt;

    /**
     * divmod(number)
     *
     * Performs division and returns an object with two properties: quotient and remainder. The sign of the remainder
     * will match the sign of the dividend.
     *
     * - bigInt(59).divmod(5) => {quotient: bigInt(11), remainder: bigInt(4) }
     * - bigInt(-5).divmod(2) => {quotient: bigInt(-2), remainder: bigInt(-1) }
     */
    divmod(number: NumOrInt): {quotient: BigInt, remainder: BigInt}; // TODO: define a DivmodResult interface

    /**
     * eq(number)
     *
     * Alias for the equals method.
     */
    eq(number: NumOrInt): boolean;

    /**
     * equals(number)
     *
     * Checks if two numbers are equal.
     *
     * - bigInt(5).equals(5) => true
     * - bigInt(4).equals(7) => false
     */
    equals(number: NumOrInt): boolean;

    /**
     * geq(number)
     *
     * Alias for the greaterOrEquals method.
     */
    geq(number: NumOrInt): boolean;

    /**
     * greater(number)
     *
     * Checks if the first number is greater than the second.
     *
     * - bigInt(5).greater(6) => false
     * - bigInt(5).greater(5) => false
     * - bigInt(5).greater(4) => true
     */
    greater(number: NumOrInt): boolean;

    /**
     * greaterOrEquals(number)
     *
     * Checks if the first number is greater than or equal to the second.
     *
     * - bigInt(5).greaterOrEquals(6) => false
     * - bigInt(5).greaterOrEquals(5) => true
     * - bigInt(5).greaterOrEquals(4) => true
     */
    greaterOrEquals(number: NumOrInt): boolean;

    /**
     * gt(number)
     *
     * Alias for the greater method.
     */
    gt(number: NumOrInt): boolean;

    /**
     * isDivisibleBy(number)
     *
     * Returns true if the first number is divisible by the second number, false otherwise.
     *
     * - bigInt(999).isDivisibleBy(333) => true
     * - bigInt(99).isDivisibleBy(5) => false
     */
    isDivisibleBy(number: NumOrInt): boolean;

    /**
     * isEven()
     *
     * Returns true if the number is even, false otherwise.
     *
     * - bigInt(6).isEven() => true
     * - bigInt(3).isEven() => false
     */
    isEven(): boolean;

    /**
     * isNegative()
     *
     * Returns true if the number is negative, false otherwise. Returns false for 0 and -0.
     *
     * - bigInt(-23).isNegative() => true
     * - bigInt(50).isNegative() => false
     */
    isNegative(): boolean;

    /**
     * isOdd()
     *
     * Returns true if the number is odd, false otherwise.
     *
     * bigInt(13).isOdd() => true
     * bigInt(40).isOdd() => false
     */
    isOdd(): boolean;

    /**
     * isPositive()
     *
     * Return true if the number is positive, false otherwise. Returns false for 0 and -0.
     *
     * - bigInt(54).isPositive() => true
     * - bigInt(-1).isPositive() => false
     */
    isPositive(): boolean;

    /**
     * isPrime()
     *
     * Returns true if the number is prime, false otherwise.
     *
     * - bigInt(5).isPrime() => true
     * - bigInt(6).isPrime() => false
     */
    isPrime(): boolean;

    /**
     * isProbablePrime([iterations])
     *
     * Returns true if the number is very likely to be positive, false otherwise. Argument is optional and determines
     * the amount of iterations of the test (default: 5). The more iterations, the lower chance of getting a false
     * positive. This uses the Fermat primality test.
     *
     * - bigInt(5).isProbablePrime() => true
     * - bigInt(49).isProbablePrime() => false
     * - bigInt(1729).isProbablePrime(50) => false
     *
     * Note that this function is not deterministic, since it relies on random sampling of factors, so the result for
     * some numbers is not always the same. Carmichael numbers are particularly prone to give unreliable results.
     *
     * For example, bigInt(1729).isProbablePrime() returns false about 76% of the time and true about 24% of the time.
     * The correct result is false.
     */
    isProbablePrime(iterations?: number): boolean; // TODO: check the argument's type, maybe it's NumOrInt

    /**
     * isUnit()
     *
     * Returns true if the number is 1 or -1, false otherwise.
     *
     * - bigInt.one.isUnit() => true
     * - bigInt.minusOne.isUnit() => true
     * - bigInt(5).isUnit() => false
     */
    isUnit(): boolean;

    /**
     * isZero()
     *
     * Return true if the number is 0 or -0, false otherwise.
     *
     * - bigInt.zero.isZero() => true
     * - bigInt("-0").isZero() => true
     * - bigInt(50).isZero() => false
     */
    isZero(): boolean;

    /**
     * leq(number)
     *
     * Alias for the lesserOrEquals method.
     */
    leq(number: NumOrInt): boolean;

    /**
     * lesser(number)
     *
     * Checks if the first number is lesser than the second.
     *
     * - bigInt(5).lesser(6) => true
     * - bigInt(5).lesser(5) => false
     * - bigInt(5).lesser(4) => false
     */
    lesser(number: NumOrInt): boolean;

    /**
     * lesserOrEquals(number)
     *
     * Checks if the first number is less than or equal to the second.
     *
     * - bigInt(5).lesserOrEquals(6) => true
     * - bigInt(5).lesserOrEquals(5) => true
     * - bigInt(5).lesserOrEquals(4) => false
     */
    lesserOrEquals(number: NumOrInt): boolean;

    /**
     * lt(number)
     *
     * Alias for the lesser method.
     */
    lt(number: NumOrInt): boolean;

    /**
     * minus(number)
     *
     * Alias for the subtract method.
     *
     * - bigInt(3).minus(5) => -2
     */
    minus(number: NumOrInt): BigInt;

    /**
     * mod(number)
     *
     * Performs division and returns the remainder, disregarding the quotient. The sign of the remainder will match the
     * sign of the dividend.
     *
     * - bigInt(59).mod(5) => 4
     * - bigInt(-5).mod(2) => -1
     */
    mod(number: NumOrInt): BigInt;

    /**
     * modPow(exp, mod)
     *
     * Takes the number to the power exp modulo mod.
     *
     * - bigInt(10).modPow(3, 30) => 10
     */
    modPow(exp: NumOrInt, mod: NumOrInt): BigInt;

    /**
     * multiply(number)
     *
     * Performs multiplication.
     *
     * - bigInt(111).multiply(111) => 12321
     */
    multiply(number: NumOrInt): BigInt;

    /**
     * neq(number)
     *
     * Alias for the notEquals method.
     */
    neq(number: NumOrInt): BigInt;

    /**
     * next()
     *
     * Adds one to the number.
     *
     * - bigInt(6).next() => 7
     */
    next(): BigInt;

    /**
     * not()
     *
     * Performs the bitwise NOT operation. The operands are treated as if they were represented using two's complement
     * representation.
     *
     * - bigInt(10).not() => -11
     * - bigInt(0).not() => -1
     */
    not(): BigInt;

    /**
     * notEquals(number)
     *
     * Checks if two numbers are not equal.
     *
     * - bigInt(5).notEquals(5) => false
     * - bigInt(4).notEquals(7) => true
     */
    notEquals(number: NumOrInt): boolean;

    /**
     * or(number)
     *
     * Performs the bitwise OR operation. The operands are treated as if they were represented using two's complement
     * representation.
     *
     * - bigInt(13).or(10) => 15
     * - bigInt(13).or(-8) => -3
     */
    or(number: NumOrInt): BigInt;

    /**
     * over(number)
     *
     * Alias for the divide method.
     *
     * - bigInt(59).over(5) => 11
     */
    over(number: NumOrInt): BigInt;

    /**
     * plus(number)
     *
     * Alias for the add method.
     *
     * bigInt(5).plus(7) => 12
     */
    plus(number: NumOrInt): BigInt;

    /**
     * pow(number)
     *
     * Performs exponentiation. If the exponent is less than 0, pow returns 0. bigInt.zero.pow(0) returns 1.
     *
     * - bigInt(16).pow(16) => 18446744073709551616
     */
    pow(number: NumOrInt): BigInt;

    /**
     * prev(number)
     *
     * Subtracts one from the number.
     *
     * - bigInt(6).prev() => 5
     */
    prev(number: NumOrInt): BigInt;

    /**
     * remainder(number)
     *
     * - Alias for the mod method.
     */
    remainder(number: NumOrInt): BigInt;

    /**
     * shiftLeft(n)
     *
     * Shifts the number left by n places in its binary representation. If a negative number is provided, it will shift
     * right. Throws an error if n is outside of the range [-9007199254740992, 9007199254740992].
     *
     * - bigInt(8).shiftLeft(2) => 32
     * - bigInt(8).shiftLeft(-2) => 2
     */
    shiftLeft(n: number): BigInt; // TODO: check the argument's type, maybe it's NumOrInt

    /**
     * shiftRight(n)
     *
     * Shifts the number right by n places in its binary representation. If a negative number is provided, it will
     * shift left. Throws an error if n is outside of the range [-9007199254740992, 9007199254740992].
     *
     * - bigInt(8).shiftRight(2) => 2
     * - bigInt(8).shiftRight(-2) => 32
     */
    shiftRight(n: number): BigInt; // TODO: check the argument's type, maybe it's NumOrInt

    /**
     * square()
     *
     * Squares the number
     *
     * bigInt(3).square() => 9
     */
    square(): BigInt;

    /**
     * subtract(number)
     *
     * Performs subtraction.
     *
     * bigInt(3).subtract(5) => -2
     */
    subtract(number: NumOrInt): BigInt;

    /**
     * times(number)
     *
     * Alias for the multiply method.
     *
     * bigInt(111).times(111) => 12321
     */
    times(number: NumOrInt): BigInt;

    /**
     * toJSNumber()
     *
     * Converts a bigInt into a native Javascript number. Loses precision for numbers outside the range
     * [-9007199254740992, 9007199254740992].
     *
     * - bigInt("18446744073709551616").toJSNumber() => 18446744073709552000
     */
    toJSNumber(): number;

    /**
     * xor(number)
     *
     * Performs the bitwise XOR operation. The operands are treated as if they were represented using two's complement
     * representation.
     *
     * - bigInt(12).xor(5) => 9
     * - bigInt(12).xor(-5) => -9
     */
    xor(number: NumOrInt): BigInt;

    /**
     * Override Methods
     */

    /**
     * toString(radix = 10)
     *
     * Converts a bigInt to a string. There is an optional radix parameter (which defaults to 10) that converts the number to the given radix. Digits in the range 10-35 will use the letters a-z.
     *
     * - bigInt("1e9").toString() => "1000000000"
     * - bigInt("1e9").toString(16) => "3b9aca00"
     *
     * Note that arithmetical operators will trigger the valueOf function rather than the toString function. When converting a bigInteger to a string, you should use the toString method or the String function instead of adding the empty string.
     *
     * - bigInt("999999999999999999").toString() => "999999999999999999"
     * - String(bigInt("999999999999999999")) => "999999999999999999"
     * - bigInt("999999999999999999") + "" => 1000000000000000000
     *
     * Bases larger than 36 are supported. If a digit is greater than or equal to 36, it will be enclosed in angle brackets.
     *
     * - bigInt(567890).toString(100) => "<56><78><90>"
     *
     * Negative bases are also supported.
     *
     * - bigInt(12345).toString(-10) => "28465"
     *
     * Base 1 and base -1 are also supported.
     *
     * - bigInt(-15).toString(1) => "-111111111111111"
     * - bigInt(-15).toString(-1) => "101010101010101010101010101010"
     *
     * Base 0 is only allowed for the number zero.
     *
     * - bigInt(0).toString(0) => 0
     * - bigInt(1).toString(0) => Error: Cannot convert nonzero numbers to base 0.
     *
     * @param radix
     */
    toString(radix?: number): string; // TODO: check the argument's type, maybe it's NumOrInt

    /**
     * valueOf()
     *
     * Converts a bigInt to a native Javascript number. This override allows you to use native arithmetic operators without explicit conversion:
     *
     * bigInt("100") + bigInt("200") === 300; //true
     */
    valueOf(): number;

    negate(): BigInt;
  }

  export interface StaticBigInt {
    /**
     * bigInt(number, [base])
     *
     * You can create a bigInt by calling the bigInt function. You can pass in
     *
     * - a string, which it will parse as an bigInt and throw an "Invalid integer" error if the parsing fails.
     * - a Javascript number, which it will parse as an bigInt and throw an "Invalid integer" error if the parsing
     * fails.
     * - another bigInt.
     *
     * nothing, and it will return bigInt.zero.
     *
     * If you provide a second parameter, then it will parse number as a number in base base. Note that base can be any
     * bigInt (even negative or zero). The letters "a-z" and "A-Z" will be interpreted as the numbers 10 to 35. Higher
     * digits can be specified in angle brackets (< and >).
     *
     * @param number
     * @param base
     */
    (number?: string | NumOrInt, base?: number | bigInt.BigInt): BigInt;

    /**
     * Constants
     *
     * There are three named constants already stored that you do not have to construct with the bigInt function
     * yourself:
     *
     * - bigInt.one, equivalent to bigInt(1)
     * - bigInt.zero, equivalent to bigInt(0)
     * - bigInt.minusOne, equivalent to bigInt(-1)
     *
     * The numbers from -999 to 999 are also already prestored and can be accessed using bigInt[index], for example:
     *
     * - bigInt[-999], equivalent to bigInt(-999)
     * - bigInt[256], equivalent to bigInt(256)
     */
    one: BigInt;
    zero: BigInt;
    minusOne: BigInt;

    // TODO: find some better way to represent prestored values
    // Prestored values sequence generated by the following code:
    // let prestored: string[] = [];
    // for (let i = -999; i <= 999; i++) {
    //   prestored.push(`'${i}': BigInt;`);
    // }
    // console.log(prestored.join(" "));
    '-999': BigInt; '-998': BigInt; '-997': BigInt; '-996': BigInt; '-995': BigInt; '-994': BigInt; '-993': BigInt; '-992': BigInt; '-991': BigInt; '-990': BigInt; '-989': BigInt; '-988': BigInt; '-987': BigInt; '-986': BigInt; '-985': BigInt; '-984': BigInt; '-983': BigInt; '-982': BigInt; '-981': BigInt; '-980': BigInt; '-979': BigInt; '-978': BigInt; '-977': BigInt; '-976': BigInt; '-975': BigInt; '-974': BigInt; '-973': BigInt; '-972': BigInt; '-971': BigInt; '-970': BigInt; '-969': BigInt; '-968': BigInt; '-967': BigInt; '-966': BigInt; '-965': BigInt; '-964': BigInt; '-963': BigInt; '-962': BigInt; '-961': BigInt; '-960': BigInt; '-959': BigInt; '-958': BigInt; '-957': BigInt; '-956': BigInt; '-955': BigInt; '-954': BigInt; '-953': BigInt; '-952': BigInt; '-951': BigInt; '-950': BigInt; '-949': BigInt; '-948': BigInt; '-947': BigInt; '-946': BigInt; '-945': BigInt; '-944': BigInt; '-943': BigInt; '-942': BigInt; '-941': BigInt; '-940': BigInt; '-939': BigInt; '-938': BigInt; '-937': BigInt; '-936': BigInt; '-935': BigInt; '-934': BigInt; '-933': BigInt; '-932': BigInt; '-931': BigInt; '-930': BigInt; '-929': BigInt; '-928': BigInt; '-927': BigInt; '-926': BigInt; '-925': BigInt; '-924': BigInt; '-923': BigInt; '-922': BigInt; '-921': BigInt; '-920': BigInt; '-919': BigInt; '-918': BigInt; '-917': BigInt; '-916': BigInt; '-915': BigInt; '-914': BigInt; '-913': BigInt; '-912': BigInt; '-911': BigInt; '-910': BigInt; '-909': BigInt; '-908': BigInt; '-907': BigInt; '-906': BigInt; '-905': BigInt; '-904': BigInt; '-903': BigInt; '-902': BigInt; '-901': BigInt; '-900': BigInt; '-899': BigInt; '-898': BigInt; '-897': BigInt; '-896': BigInt; '-895': BigInt; '-894': BigInt; '-893': BigInt; '-892': BigInt; '-891': BigInt; '-890': BigInt; '-889': BigInt; '-888': BigInt; '-887': BigInt; '-886': BigInt; '-885': BigInt; '-884': BigInt; '-883': BigInt; '-882': BigInt; '-881': BigInt; '-880': BigInt; '-879': BigInt; '-878': BigInt; '-877': BigInt; '-876': BigInt; '-875': BigInt; '-874': BigInt; '-873': BigInt; '-872': BigInt; '-871': BigInt; '-870': BigInt; '-869': BigInt; '-868': BigInt; '-867': BigInt; '-866': BigInt; '-865': BigInt; '-864': BigInt; '-863': BigInt; '-862': BigInt; '-861': BigInt; '-860': BigInt; '-859': BigInt; '-858': BigInt; '-857': BigInt; '-856': BigInt; '-855': BigInt; '-854': BigInt; '-853': BigInt; '-852': BigInt; '-851': BigInt; '-850': BigInt; '-849': BigInt; '-848': BigInt; '-847': BigInt; '-846': BigInt; '-845': BigInt; '-844': BigInt; '-843': BigInt; '-842': BigInt; '-841': BigInt; '-840': BigInt; '-839': BigInt; '-838': BigInt; '-837': BigInt; '-836': BigInt; '-835': BigInt; '-834': BigInt; '-833': BigInt; '-832': BigInt; '-831': BigInt; '-830': BigInt; '-829': BigInt; '-828': BigInt; '-827': BigInt; '-826': BigInt; '-825': BigInt; '-824': BigInt; '-823': BigInt; '-822': BigInt; '-821': BigInt; '-820': BigInt; '-819': BigInt; '-818': BigInt; '-817': BigInt; '-816': BigInt; '-815': BigInt; '-814': BigInt; '-813': BigInt; '-812': BigInt; '-811': BigInt; '-810': BigInt; '-809': BigInt; '-808': BigInt; '-807': BigInt; '-806': BigInt; '-805': BigInt; '-804': BigInt; '-803': BigInt; '-802': BigInt; '-801': BigInt; '-800': BigInt; '-799': BigInt; '-798': BigInt; '-797': BigInt; '-796': BigInt; '-795': BigInt; '-794': BigInt; '-793': BigInt; '-792': BigInt; '-791': BigInt; '-790': BigInt; '-789': BigInt; '-788': BigInt; '-787': BigInt; '-786': BigInt; '-785': BigInt; '-784': BigInt; '-783': BigInt; '-782': BigInt; '-781': BigInt; '-780': BigInt; '-779': BigInt; '-778': BigInt; '-777': BigInt; '-776': BigInt; '-775': BigInt; '-774': BigInt; '-773': BigInt; '-772': BigInt; '-771': BigInt; '-770': BigInt; '-769': BigInt; '-768': BigInt; '-767': BigInt; '-766': BigInt; '-765': BigInt; '-764': BigInt; '-763': BigInt; '-762': BigInt; '-761': BigInt; '-760': BigInt; '-759': BigInt; '-758': BigInt; '-757': BigInt; '-756': BigInt; '-755': BigInt; '-754': BigInt; '-753': BigInt; '-752': BigInt; '-751': BigInt; '-750': BigInt; '-749': BigInt; '-748': BigInt; '-747': BigInt; '-746': BigInt; '-745': BigInt; '-744': BigInt; '-743': BigInt; '-742': BigInt; '-741': BigInt; '-740': BigInt; '-739': BigInt; '-738': BigInt; '-737': BigInt; '-736': BigInt; '-735': BigInt; '-734': BigInt; '-733': BigInt; '-732': BigInt; '-731': BigInt; '-730': BigInt; '-729': BigInt; '-728': BigInt; '-727': BigInt; '-726': BigInt; '-725': BigInt; '-724': BigInt; '-723': BigInt; '-722': BigInt; '-721': BigInt; '-720': BigInt; '-719': BigInt; '-718': BigInt; '-717': BigInt; '-716': BigInt; '-715': BigInt; '-714': BigInt; '-713': BigInt; '-712': BigInt; '-711': BigInt; '-710': BigInt; '-709': BigInt; '-708': BigInt; '-707': BigInt; '-706': BigInt; '-705': BigInt; '-704': BigInt; '-703': BigInt; '-702': BigInt; '-701': BigInt; '-700': BigInt; '-699': BigInt; '-698': BigInt; '-697': BigInt; '-696': BigInt; '-695': BigInt; '-694': BigInt; '-693': BigInt; '-692': BigInt; '-691': BigInt; '-690': BigInt; '-689': BigInt; '-688': BigInt; '-687': BigInt; '-686': BigInt; '-685': BigInt; '-684': BigInt; '-683': BigInt; '-682': BigInt; '-681': BigInt; '-680': BigInt; '-679': BigInt; '-678': BigInt; '-677': BigInt; '-676': BigInt; '-675': BigInt; '-674': BigInt; '-673': BigInt; '-672': BigInt; '-671': BigInt; '-670': BigInt; '-669': BigInt; '-668': BigInt; '-667': BigInt; '-666': BigInt; '-665': BigInt; '-664': BigInt; '-663': BigInt; '-662': BigInt; '-661': BigInt; '-660': BigInt; '-659': BigInt; '-658': BigInt; '-657': BigInt; '-656': BigInt; '-655': BigInt; '-654': BigInt; '-653': BigInt; '-652': BigInt; '-651': BigInt; '-650': BigInt; '-649': BigInt; '-648': BigInt; '-647': BigInt; '-646': BigInt; '-645': BigInt; '-644': BigInt; '-643': BigInt; '-642': BigInt; '-641': BigInt; '-640': BigInt; '-639': BigInt; '-638': BigInt; '-637': BigInt; '-636': BigInt; '-635': BigInt; '-634': BigInt; '-633': BigInt; '-632': BigInt; '-631': BigInt; '-630': BigInt; '-629': BigInt; '-628': BigInt; '-627': BigInt; '-626': BigInt; '-625': BigInt; '-624': BigInt; '-623': BigInt; '-622': BigInt; '-621': BigInt; '-620': BigInt; '-619': BigInt; '-618': BigInt; '-617': BigInt; '-616': BigInt; '-615': BigInt; '-614': BigInt; '-613': BigInt; '-612': BigInt; '-611': BigInt; '-610': BigInt; '-609': BigInt; '-608': BigInt; '-607': BigInt; '-606': BigInt; '-605': BigInt; '-604': BigInt; '-603': BigInt; '-602': BigInt; '-601': BigInt; '-600': BigInt; '-599': BigInt; '-598': BigInt; '-597': BigInt; '-596': BigInt; '-595': BigInt; '-594': BigInt; '-593': BigInt; '-592': BigInt; '-591': BigInt; '-590': BigInt; '-589': BigInt; '-588': BigInt; '-587': BigInt; '-586': BigInt; '-585': BigInt; '-584': BigInt; '-583': BigInt; '-582': BigInt; '-581': BigInt; '-580': BigInt; '-579': BigInt; '-578': BigInt; '-577': BigInt; '-576': BigInt; '-575': BigInt; '-574': BigInt; '-573': BigInt; '-572': BigInt; '-571': BigInt; '-570': BigInt; '-569': BigInt; '-568': BigInt; '-567': BigInt; '-566': BigInt; '-565': BigInt; '-564': BigInt; '-563': BigInt; '-562': BigInt; '-561': BigInt; '-560': BigInt; '-559': BigInt; '-558': BigInt; '-557': BigInt; '-556': BigInt; '-555': BigInt; '-554': BigInt; '-553': BigInt; '-552': BigInt; '-551': BigInt; '-550': BigInt; '-549': BigInt; '-548': BigInt; '-547': BigInt; '-546': BigInt; '-545': BigInt; '-544': BigInt; '-543': BigInt; '-542': BigInt; '-541': BigInt; '-540': BigInt; '-539': BigInt; '-538': BigInt; '-537': BigInt; '-536': BigInt; '-535': BigInt; '-534': BigInt; '-533': BigInt; '-532': BigInt; '-531': BigInt; '-530': BigInt; '-529': BigInt; '-528': BigInt; '-527': BigInt; '-526': BigInt; '-525': BigInt; '-524': BigInt; '-523': BigInt; '-522': BigInt; '-521': BigInt; '-520': BigInt; '-519': BigInt; '-518': BigInt; '-517': BigInt; '-516': BigInt; '-515': BigInt; '-514': BigInt; '-513': BigInt; '-512': BigInt; '-511': BigInt; '-510': BigInt; '-509': BigInt; '-508': BigInt; '-507': BigInt; '-506': BigInt; '-505': BigInt; '-504': BigInt; '-503': BigInt; '-502': BigInt; '-501': BigInt; '-500': BigInt; '-499': BigInt; '-498': BigInt; '-497': BigInt; '-496': BigInt; '-495': BigInt; '-494': BigInt; '-493': BigInt; '-492': BigInt; '-491': BigInt; '-490': BigInt; '-489': BigInt; '-488': BigInt; '-487': BigInt; '-486': BigInt; '-485': BigInt; '-484': BigInt; '-483': BigInt; '-482': BigInt; '-481': BigInt; '-480': BigInt; '-479': BigInt; '-478': BigInt; '-477': BigInt; '-476': BigInt; '-475': BigInt; '-474': BigInt; '-473': BigInt; '-472': BigInt; '-471': BigInt; '-470': BigInt; '-469': BigInt; '-468': BigInt; '-467': BigInt; '-466': BigInt; '-465': BigInt; '-464': BigInt; '-463': BigInt; '-462': BigInt; '-461': BigInt; '-460': BigInt; '-459': BigInt; '-458': BigInt; '-457': BigInt; '-456': BigInt; '-455': BigInt; '-454': BigInt; '-453': BigInt; '-452': BigInt; '-451': BigInt; '-450': BigInt; '-449': BigInt; '-448': BigInt; '-447': BigInt; '-446': BigInt; '-445': BigInt; '-444': BigInt; '-443': BigInt; '-442': BigInt; '-441': BigInt; '-440': BigInt; '-439': BigInt; '-438': BigInt; '-437': BigInt; '-436': BigInt; '-435': BigInt; '-434': BigInt; '-433': BigInt; '-432': BigInt; '-431': BigInt; '-430': BigInt; '-429': BigInt; '-428': BigInt; '-427': BigInt; '-426': BigInt; '-425': BigInt; '-424': BigInt; '-423': BigInt; '-422': BigInt; '-421': BigInt; '-420': BigInt; '-419': BigInt; '-418': BigInt; '-417': BigInt; '-416': BigInt; '-415': BigInt; '-414': BigInt; '-413': BigInt; '-412': BigInt; '-411': BigInt; '-410': BigInt; '-409': BigInt; '-408': BigInt; '-407': BigInt; '-406': BigInt; '-405': BigInt; '-404': BigInt; '-403': BigInt; '-402': BigInt; '-401': BigInt; '-400': BigInt; '-399': BigInt; '-398': BigInt; '-397': BigInt; '-396': BigInt; '-395': BigInt; '-394': BigInt; '-393': BigInt; '-392': BigInt; '-391': BigInt; '-390': BigInt; '-389': BigInt; '-388': BigInt; '-387': BigInt; '-386': BigInt; '-385': BigInt; '-384': BigInt; '-383': BigInt; '-382': BigInt; '-381': BigInt; '-380': BigInt; '-379': BigInt; '-378': BigInt; '-377': BigInt; '-376': BigInt; '-375': BigInt; '-374': BigInt; '-373': BigInt; '-372': BigInt; '-371': BigInt; '-370': BigInt; '-369': BigInt; '-368': BigInt; '-367': BigInt; '-366': BigInt; '-365': BigInt; '-364': BigInt; '-363': BigInt; '-362': BigInt; '-361': BigInt; '-360': BigInt; '-359': BigInt; '-358': BigInt; '-357': BigInt; '-356': BigInt; '-355': BigInt; '-354': BigInt; '-353': BigInt; '-352': BigInt; '-351': BigInt; '-350': BigInt; '-349': BigInt; '-348': BigInt; '-347': BigInt; '-346': BigInt; '-345': BigInt; '-344': BigInt; '-343': BigInt; '-342': BigInt; '-341': BigInt; '-340': BigInt; '-339': BigInt; '-338': BigInt; '-337': BigInt; '-336': BigInt; '-335': BigInt; '-334': BigInt; '-333': BigInt; '-332': BigInt; '-331': BigInt; '-330': BigInt; '-329': BigInt; '-328': BigInt; '-327': BigInt; '-326': BigInt; '-325': BigInt; '-324': BigInt; '-323': BigInt; '-322': BigInt; '-321': BigInt; '-320': BigInt; '-319': BigInt; '-318': BigInt; '-317': BigInt; '-316': BigInt; '-315': BigInt; '-314': BigInt; '-313': BigInt; '-312': BigInt; '-311': BigInt; '-310': BigInt; '-309': BigInt; '-308': BigInt; '-307': BigInt; '-306': BigInt; '-305': BigInt; '-304': BigInt; '-303': BigInt; '-302': BigInt; '-301': BigInt; '-300': BigInt; '-299': BigInt; '-298': BigInt; '-297': BigInt; '-296': BigInt; '-295': BigInt; '-294': BigInt; '-293': BigInt; '-292': BigInt; '-291': BigInt; '-290': BigInt; '-289': BigInt; '-288': BigInt; '-287': BigInt; '-286': BigInt; '-285': BigInt; '-284': BigInt; '-283': BigInt; '-282': BigInt; '-281': BigInt; '-280': BigInt; '-279': BigInt; '-278': BigInt; '-277': BigInt; '-276': BigInt; '-275': BigInt; '-274': BigInt; '-273': BigInt; '-272': BigInt; '-271': BigInt; '-270': BigInt; '-269': BigInt; '-268': BigInt; '-267': BigInt; '-266': BigInt; '-265': BigInt; '-264': BigInt; '-263': BigInt; '-262': BigInt; '-261': BigInt; '-260': BigInt; '-259': BigInt; '-258': BigInt; '-257': BigInt; '-256': BigInt; '-255': BigInt; '-254': BigInt; '-253': BigInt; '-252': BigInt; '-251': BigInt; '-250': BigInt; '-249': BigInt; '-248': BigInt; '-247': BigInt; '-246': BigInt; '-245': BigInt; '-244': BigInt; '-243': BigInt; '-242': BigInt; '-241': BigInt; '-240': BigInt; '-239': BigInt; '-238': BigInt; '-237': BigInt; '-236': BigInt; '-235': BigInt; '-234': BigInt; '-233': BigInt; '-232': BigInt; '-231': BigInt; '-230': BigInt; '-229': BigInt; '-228': BigInt; '-227': BigInt; '-226': BigInt; '-225': BigInt; '-224': BigInt; '-223': BigInt; '-222': BigInt; '-221': BigInt; '-220': BigInt; '-219': BigInt; '-218': BigInt; '-217': BigInt; '-216': BigInt; '-215': BigInt; '-214': BigInt; '-213': BigInt; '-212': BigInt; '-211': BigInt; '-210': BigInt; '-209': BigInt; '-208': BigInt; '-207': BigInt; '-206': BigInt; '-205': BigInt; '-204': BigInt; '-203': BigInt; '-202': BigInt; '-201': BigInt; '-200': BigInt; '-199': BigInt; '-198': BigInt; '-197': BigInt; '-196': BigInt; '-195': BigInt; '-194': BigInt; '-193': BigInt; '-192': BigInt; '-191': BigInt; '-190': BigInt; '-189': BigInt; '-188': BigInt; '-187': BigInt; '-186': BigInt; '-185': BigInt; '-184': BigInt; '-183': BigInt; '-182': BigInt; '-181': BigInt; '-180': BigInt; '-179': BigInt; '-178': BigInt; '-177': BigInt; '-176': BigInt; '-175': BigInt; '-174': BigInt; '-173': BigInt; '-172': BigInt; '-171': BigInt; '-170': BigInt; '-169': BigInt; '-168': BigInt; '-167': BigInt; '-166': BigInt; '-165': BigInt; '-164': BigInt; '-163': BigInt; '-162': BigInt; '-161': BigInt; '-160': BigInt; '-159': BigInt; '-158': BigInt; '-157': BigInt; '-156': BigInt; '-155': BigInt; '-154': BigInt; '-153': BigInt; '-152': BigInt; '-151': BigInt; '-150': BigInt; '-149': BigInt; '-148': BigInt; '-147': BigInt; '-146': BigInt; '-145': BigInt; '-144': BigInt; '-143': BigInt; '-142': BigInt; '-141': BigInt; '-140': BigInt; '-139': BigInt; '-138': BigInt; '-137': BigInt; '-136': BigInt; '-135': BigInt; '-134': BigInt; '-133': BigInt; '-132': BigInt; '-131': BigInt; '-130': BigInt; '-129': BigInt; '-128': BigInt; '-127': BigInt; '-126': BigInt; '-125': BigInt; '-124': BigInt; '-123': BigInt; '-122': BigInt; '-121': BigInt; '-120': BigInt; '-119': BigInt; '-118': BigInt; '-117': BigInt; '-116': BigInt; '-115': BigInt; '-114': BigInt; '-113': BigInt; '-112': BigInt; '-111': BigInt; '-110': BigInt; '-109': BigInt; '-108': BigInt; '-107': BigInt; '-106': BigInt; '-105': BigInt; '-104': BigInt; '-103': BigInt; '-102': BigInt; '-101': BigInt; '-100': BigInt; '-99': BigInt; '-98': BigInt; '-97': BigInt; '-96': BigInt; '-95': BigInt; '-94': BigInt; '-93': BigInt; '-92': BigInt; '-91': BigInt; '-90': BigInt; '-89': BigInt; '-88': BigInt; '-87': BigInt; '-86': BigInt; '-85': BigInt; '-84': BigInt; '-83': BigInt; '-82': BigInt; '-81': BigInt; '-80': BigInt; '-79': BigInt; '-78': BigInt; '-77': BigInt; '-76': BigInt; '-75': BigInt; '-74': BigInt; '-73': BigInt; '-72': BigInt; '-71': BigInt; '-70': BigInt; '-69': BigInt; '-68': BigInt; '-67': BigInt; '-66': BigInt; '-65': BigInt; '-64': BigInt; '-63': BigInt; '-62': BigInt; '-61': BigInt; '-60': BigInt; '-59': BigInt; '-58': BigInt; '-57': BigInt; '-56': BigInt; '-55': BigInt; '-54': BigInt; '-53': BigInt; '-52': BigInt; '-51': BigInt; '-50': BigInt; '-49': BigInt; '-48': BigInt; '-47': BigInt; '-46': BigInt; '-45': BigInt; '-44': BigInt; '-43': BigInt; '-42': BigInt; '-41': BigInt; '-40': BigInt; '-39': BigInt; '-38': BigInt; '-37': BigInt; '-36': BigInt; '-35': BigInt; '-34': BigInt; '-33': BigInt; '-32': BigInt; '-31': BigInt; '-30': BigInt; '-29': BigInt; '-28': BigInt; '-27': BigInt; '-26': BigInt; '-25': BigInt; '-24': BigInt; '-23': BigInt; '-22': BigInt; '-21': BigInt; '-20': BigInt; '-19': BigInt; '-18': BigInt; '-17': BigInt; '-16': BigInt; '-15': BigInt; '-14': BigInt; '-13': BigInt; '-12': BigInt; '-11': BigInt; '-10': BigInt; '-9': BigInt; '-8': BigInt; '-7': BigInt; '-6': BigInt; '-5': BigInt; '-4': BigInt; '-3': BigInt; '-2': BigInt; '-1': BigInt; '0': BigInt; '1': BigInt; '2': BigInt; '3': BigInt; '4': BigInt; '5': BigInt; '6': BigInt; '7': BigInt; '8': BigInt; '9': BigInt; '10': BigInt; '11': BigInt; '12': BigInt; '13': BigInt; '14': BigInt; '15': BigInt; '16': BigInt; '17': BigInt; '18': BigInt; '19': BigInt; '20': BigInt; '21': BigInt; '22': BigInt; '23': BigInt; '24': BigInt; '25': BigInt; '26': BigInt; '27': BigInt; '28': BigInt; '29': BigInt; '30': BigInt; '31': BigInt; '32': BigInt; '33': BigInt; '34': BigInt; '35': BigInt; '36': BigInt; '37': BigInt; '38': BigInt; '39': BigInt; '40': BigInt; '41': BigInt; '42': BigInt; '43': BigInt; '44': BigInt; '45': BigInt; '46': BigInt; '47': BigInt; '48': BigInt; '49': BigInt; '50': BigInt; '51': BigInt; '52': BigInt; '53': BigInt; '54': BigInt; '55': BigInt; '56': BigInt; '57': BigInt; '58': BigInt; '59': BigInt; '60': BigInt; '61': BigInt; '62': BigInt; '63': BigInt; '64': BigInt; '65': BigInt; '66': BigInt; '67': BigInt; '68': BigInt; '69': BigInt; '70': BigInt; '71': BigInt; '72': BigInt; '73': BigInt; '74': BigInt; '75': BigInt; '76': BigInt; '77': BigInt; '78': BigInt; '79': BigInt; '80': BigInt; '81': BigInt; '82': BigInt; '83': BigInt; '84': BigInt; '85': BigInt; '86': BigInt; '87': BigInt; '88': BigInt; '89': BigInt; '90': BigInt; '91': BigInt; '92': BigInt; '93': BigInt; '94': BigInt; '95': BigInt; '96': BigInt; '97': BigInt; '98': BigInt; '99': BigInt; '100': BigInt; '101': BigInt; '102': BigInt; '103': BigInt; '104': BigInt; '105': BigInt; '106': BigInt; '107': BigInt; '108': BigInt; '109': BigInt; '110': BigInt; '111': BigInt; '112': BigInt; '113': BigInt; '114': BigInt; '115': BigInt; '116': BigInt; '117': BigInt; '118': BigInt; '119': BigInt; '120': BigInt; '121': BigInt; '122': BigInt; '123': BigInt; '124': BigInt; '125': BigInt; '126': BigInt; '127': BigInt; '128': BigInt; '129': BigInt; '130': BigInt; '131': BigInt; '132': BigInt; '133': BigInt; '134': BigInt; '135': BigInt; '136': BigInt; '137': BigInt; '138': BigInt; '139': BigInt; '140': BigInt; '141': BigInt; '142': BigInt; '143': BigInt; '144': BigInt; '145': BigInt; '146': BigInt; '147': BigInt; '148': BigInt; '149': BigInt; '150': BigInt; '151': BigInt; '152': BigInt; '153': BigInt; '154': BigInt; '155': BigInt; '156': BigInt; '157': BigInt; '158': BigInt; '159': BigInt; '160': BigInt; '161': BigInt; '162': BigInt; '163': BigInt; '164': BigInt; '165': BigInt; '166': BigInt; '167': BigInt; '168': BigInt; '169': BigInt; '170': BigInt; '171': BigInt; '172': BigInt; '173': BigInt; '174': BigInt; '175': BigInt; '176': BigInt; '177': BigInt; '178': BigInt; '179': BigInt; '180': BigInt; '181': BigInt; '182': BigInt; '183': BigInt; '184': BigInt; '185': BigInt; '186': BigInt; '187': BigInt; '188': BigInt; '189': BigInt; '190': BigInt; '191': BigInt; '192': BigInt; '193': BigInt; '194': BigInt; '195': BigInt; '196': BigInt; '197': BigInt; '198': BigInt; '199': BigInt; '200': BigInt; '201': BigInt; '202': BigInt; '203': BigInt; '204': BigInt; '205': BigInt; '206': BigInt; '207': BigInt; '208': BigInt; '209': BigInt; '210': BigInt; '211': BigInt; '212': BigInt; '213': BigInt; '214': BigInt; '215': BigInt; '216': BigInt; '217': BigInt; '218': BigInt; '219': BigInt; '220': BigInt; '221': BigInt; '222': BigInt; '223': BigInt; '224': BigInt; '225': BigInt; '226': BigInt; '227': BigInt; '228': BigInt; '229': BigInt; '230': BigInt; '231': BigInt; '232': BigInt; '233': BigInt; '234': BigInt; '235': BigInt; '236': BigInt; '237': BigInt; '238': BigInt; '239': BigInt; '240': BigInt; '241': BigInt; '242': BigInt; '243': BigInt; '244': BigInt; '245': BigInt; '246': BigInt; '247': BigInt; '248': BigInt; '249': BigInt; '250': BigInt; '251': BigInt; '252': BigInt; '253': BigInt; '254': BigInt; '255': BigInt; '256': BigInt; '257': BigInt; '258': BigInt; '259': BigInt; '260': BigInt; '261': BigInt; '262': BigInt; '263': BigInt; '264': BigInt; '265': BigInt; '266': BigInt; '267': BigInt; '268': BigInt; '269': BigInt; '270': BigInt; '271': BigInt; '272': BigInt; '273': BigInt; '274': BigInt; '275': BigInt; '276': BigInt; '277': BigInt; '278': BigInt; '279': BigInt; '280': BigInt; '281': BigInt; '282': BigInt; '283': BigInt; '284': BigInt; '285': BigInt; '286': BigInt; '287': BigInt; '288': BigInt; '289': BigInt; '290': BigInt; '291': BigInt; '292': BigInt; '293': BigInt; '294': BigInt; '295': BigInt; '296': BigInt; '297': BigInt; '298': BigInt; '299': BigInt; '300': BigInt; '301': BigInt; '302': BigInt; '303': BigInt; '304': BigInt; '305': BigInt; '306': BigInt; '307': BigInt; '308': BigInt; '309': BigInt; '310': BigInt; '311': BigInt; '312': BigInt; '313': BigInt; '314': BigInt; '315': BigInt; '316': BigInt; '317': BigInt; '318': BigInt; '319': BigInt; '320': BigInt; '321': BigInt; '322': BigInt; '323': BigInt; '324': BigInt; '325': BigInt; '326': BigInt; '327': BigInt; '328': BigInt; '329': BigInt; '330': BigInt; '331': BigInt; '332': BigInt; '333': BigInt; '334': BigInt; '335': BigInt; '336': BigInt; '337': BigInt; '338': BigInt; '339': BigInt; '340': BigInt; '341': BigInt; '342': BigInt; '343': BigInt; '344': BigInt; '345': BigInt; '346': BigInt; '347': BigInt; '348': BigInt; '349': BigInt; '350': BigInt; '351': BigInt; '352': BigInt; '353': BigInt; '354': BigInt; '355': BigInt; '356': BigInt; '357': BigInt; '358': BigInt; '359': BigInt; '360': BigInt; '361': BigInt; '362': BigInt; '363': BigInt; '364': BigInt; '365': BigInt; '366': BigInt; '367': BigInt; '368': BigInt; '369': BigInt; '370': BigInt; '371': BigInt; '372': BigInt; '373': BigInt; '374': BigInt; '375': BigInt; '376': BigInt; '377': BigInt; '378': BigInt; '379': BigInt; '380': BigInt; '381': BigInt; '382': BigInt; '383': BigInt; '384': BigInt; '385': BigInt; '386': BigInt; '387': BigInt; '388': BigInt; '389': BigInt; '390': BigInt; '391': BigInt; '392': BigInt; '393': BigInt; '394': BigInt; '395': BigInt; '396': BigInt; '397': BigInt; '398': BigInt; '399': BigInt; '400': BigInt; '401': BigInt; '402': BigInt; '403': BigInt; '404': BigInt; '405': BigInt; '406': BigInt; '407': BigInt; '408': BigInt; '409': BigInt; '410': BigInt; '411': BigInt; '412': BigInt; '413': BigInt; '414': BigInt; '415': BigInt; '416': BigInt; '417': BigInt; '418': BigInt; '419': BigInt; '420': BigInt; '421': BigInt; '422': BigInt; '423': BigInt; '424': BigInt; '425': BigInt; '426': BigInt; '427': BigInt; '428': BigInt; '429': BigInt; '430': BigInt; '431': BigInt; '432': BigInt; '433': BigInt; '434': BigInt; '435': BigInt; '436': BigInt; '437': BigInt; '438': BigInt; '439': BigInt; '440': BigInt; '441': BigInt; '442': BigInt; '443': BigInt; '444': BigInt; '445': BigInt; '446': BigInt; '447': BigInt; '448': BigInt; '449': BigInt; '450': BigInt; '451': BigInt; '452': BigInt; '453': BigInt; '454': BigInt; '455': BigInt; '456': BigInt; '457': BigInt; '458': BigInt; '459': BigInt; '460': BigInt; '461': BigInt; '462': BigInt; '463': BigInt; '464': BigInt; '465': BigInt; '466': BigInt; '467': BigInt; '468': BigInt; '469': BigInt; '470': BigInt; '471': BigInt; '472': BigInt; '473': BigInt; '474': BigInt; '475': BigInt; '476': BigInt; '477': BigInt; '478': BigInt; '479': BigInt; '480': BigInt; '481': BigInt; '482': BigInt; '483': BigInt; '484': BigInt; '485': BigInt; '486': BigInt; '487': BigInt; '488': BigInt; '489': BigInt; '490': BigInt; '491': BigInt; '492': BigInt; '493': BigInt; '494': BigInt; '495': BigInt; '496': BigInt; '497': BigInt; '498': BigInt; '499': BigInt; '500': BigInt; '501': BigInt; '502': BigInt; '503': BigInt; '504': BigInt; '505': BigInt; '506': BigInt; '507': BigInt; '508': BigInt; '509': BigInt; '510': BigInt; '511': BigInt; '512': BigInt; '513': BigInt; '514': BigInt; '515': BigInt; '516': BigInt; '517': BigInt; '518': BigInt; '519': BigInt; '520': BigInt; '521': BigInt; '522': BigInt; '523': BigInt; '524': BigInt; '525': BigInt; '526': BigInt; '527': BigInt; '528': BigInt; '529': BigInt; '530': BigInt; '531': BigInt; '532': BigInt; '533': BigInt; '534': BigInt; '535': BigInt; '536': BigInt; '537': BigInt; '538': BigInt; '539': BigInt; '540': BigInt; '541': BigInt; '542': BigInt; '543': BigInt; '544': BigInt; '545': BigInt; '546': BigInt; '547': BigInt; '548': BigInt; '549': BigInt; '550': BigInt; '551': BigInt; '552': BigInt; '553': BigInt; '554': BigInt; '555': BigInt; '556': BigInt; '557': BigInt; '558': BigInt; '559': BigInt; '560': BigInt; '561': BigInt; '562': BigInt; '563': BigInt; '564': BigInt; '565': BigInt; '566': BigInt; '567': BigInt; '568': BigInt; '569': BigInt; '570': BigInt; '571': BigInt; '572': BigInt; '573': BigInt; '574': BigInt; '575': BigInt; '576': BigInt; '577': BigInt; '578': BigInt; '579': BigInt; '580': BigInt; '581': BigInt; '582': BigInt; '583': BigInt; '584': BigInt; '585': BigInt; '586': BigInt; '587': BigInt; '588': BigInt; '589': BigInt; '590': BigInt; '591': BigInt; '592': BigInt; '593': BigInt; '594': BigInt; '595': BigInt; '596': BigInt; '597': BigInt; '598': BigInt; '599': BigInt; '600': BigInt; '601': BigInt; '602': BigInt; '603': BigInt; '604': BigInt; '605': BigInt; '606': BigInt; '607': BigInt; '608': BigInt; '609': BigInt; '610': BigInt; '611': BigInt; '612': BigInt; '613': BigInt; '614': BigInt; '615': BigInt; '616': BigInt; '617': BigInt; '618': BigInt; '619': BigInt; '620': BigInt; '621': BigInt; '622': BigInt; '623': BigInt; '624': BigInt; '625': BigInt; '626': BigInt; '627': BigInt; '628': BigInt; '629': BigInt; '630': BigInt; '631': BigInt; '632': BigInt; '633': BigInt; '634': BigInt; '635': BigInt; '636': BigInt; '637': BigInt; '638': BigInt; '639': BigInt; '640': BigInt; '641': BigInt; '642': BigInt; '643': BigInt; '644': BigInt; '645': BigInt; '646': BigInt; '647': BigInt; '648': BigInt; '649': BigInt; '650': BigInt; '651': BigInt; '652': BigInt; '653': BigInt; '654': BigInt; '655': BigInt; '656': BigInt; '657': BigInt; '658': BigInt; '659': BigInt; '660': BigInt; '661': BigInt; '662': BigInt; '663': BigInt; '664': BigInt; '665': BigInt; '666': BigInt; '667': BigInt; '668': BigInt; '669': BigInt; '670': BigInt; '671': BigInt; '672': BigInt; '673': BigInt; '674': BigInt; '675': BigInt; '676': BigInt; '677': BigInt; '678': BigInt; '679': BigInt; '680': BigInt; '681': BigInt; '682': BigInt; '683': BigInt; '684': BigInt; '685': BigInt; '686': BigInt; '687': BigInt; '688': BigInt; '689': BigInt; '690': BigInt; '691': BigInt; '692': BigInt; '693': BigInt; '694': BigInt; '695': BigInt; '696': BigInt; '697': BigInt; '698': BigInt; '699': BigInt; '700': BigInt; '701': BigInt; '702': BigInt; '703': BigInt; '704': BigInt; '705': BigInt; '706': BigInt; '707': BigInt; '708': BigInt; '709': BigInt; '710': BigInt; '711': BigInt; '712': BigInt; '713': BigInt; '714': BigInt; '715': BigInt; '716': BigInt; '717': BigInt; '718': BigInt; '719': BigInt; '720': BigInt; '721': BigInt; '722': BigInt; '723': BigInt; '724': BigInt; '725': BigInt; '726': BigInt; '727': BigInt; '728': BigInt; '729': BigInt; '730': BigInt; '731': BigInt; '732': BigInt; '733': BigInt; '734': BigInt; '735': BigInt; '736': BigInt; '737': BigInt; '738': BigInt; '739': BigInt; '740': BigInt; '741': BigInt; '742': BigInt; '743': BigInt; '744': BigInt; '745': BigInt; '746': BigInt; '747': BigInt; '748': BigInt; '749': BigInt; '750': BigInt; '751': BigInt; '752': BigInt; '753': BigInt; '754': BigInt; '755': BigInt; '756': BigInt; '757': BigInt; '758': BigInt; '759': BigInt; '760': BigInt; '761': BigInt; '762': BigInt; '763': BigInt; '764': BigInt; '765': BigInt; '766': BigInt; '767': BigInt; '768': BigInt; '769': BigInt; '770': BigInt; '771': BigInt; '772': BigInt; '773': BigInt; '774': BigInt; '775': BigInt; '776': BigInt; '777': BigInt; '778': BigInt; '779': BigInt; '780': BigInt; '781': BigInt; '782': BigInt; '783': BigInt; '784': BigInt; '785': BigInt; '786': BigInt; '787': BigInt; '788': BigInt; '789': BigInt; '790': BigInt; '791': BigInt; '792': BigInt; '793': BigInt; '794': BigInt; '795': BigInt; '796': BigInt; '797': BigInt; '798': BigInt; '799': BigInt; '800': BigInt; '801': BigInt; '802': BigInt; '803': BigInt; '804': BigInt; '805': BigInt; '806': BigInt; '807': BigInt; '808': BigInt; '809': BigInt; '810': BigInt; '811': BigInt; '812': BigInt; '813': BigInt; '814': BigInt; '815': BigInt; '816': BigInt; '817': BigInt; '818': BigInt; '819': BigInt; '820': BigInt; '821': BigInt; '822': BigInt; '823': BigInt; '824': BigInt; '825': BigInt; '826': BigInt; '827': BigInt; '828': BigInt; '829': BigInt; '830': BigInt; '831': BigInt; '832': BigInt; '833': BigInt; '834': BigInt; '835': BigInt; '836': BigInt; '837': BigInt; '838': BigInt; '839': BigInt; '840': BigInt; '841': BigInt; '842': BigInt; '843': BigInt; '844': BigInt; '845': BigInt; '846': BigInt; '847': BigInt; '848': BigInt; '849': BigInt; '850': BigInt; '851': BigInt; '852': BigInt; '853': BigInt; '854': BigInt; '855': BigInt; '856': BigInt; '857': BigInt; '858': BigInt; '859': BigInt; '860': BigInt; '861': BigInt; '862': BigInt; '863': BigInt; '864': BigInt; '865': BigInt; '866': BigInt; '867': BigInt; '868': BigInt; '869': BigInt; '870': BigInt; '871': BigInt; '872': BigInt; '873': BigInt; '874': BigInt; '875': BigInt; '876': BigInt; '877': BigInt; '878': BigInt; '879': BigInt; '880': BigInt; '881': BigInt; '882': BigInt; '883': BigInt; '884': BigInt; '885': BigInt; '886': BigInt; '887': BigInt; '888': BigInt; '889': BigInt; '890': BigInt; '891': BigInt; '892': BigInt; '893': BigInt; '894': BigInt; '895': BigInt; '896': BigInt; '897': BigInt; '898': BigInt; '899': BigInt; '900': BigInt; '901': BigInt; '902': BigInt; '903': BigInt; '904': BigInt; '905': BigInt; '906': BigInt; '907': BigInt; '908': BigInt; '909': BigInt; '910': BigInt; '911': BigInt; '912': BigInt; '913': BigInt; '914': BigInt; '915': BigInt; '916': BigInt; '917': BigInt; '918': BigInt; '919': BigInt; '920': BigInt; '921': BigInt; '922': BigInt; '923': BigInt; '924': BigInt; '925': BigInt; '926': BigInt; '927': BigInt; '928': BigInt; '929': BigInt; '930': BigInt; '931': BigInt; '932': BigInt; '933': BigInt; '934': BigInt; '935': BigInt; '936': BigInt; '937': BigInt; '938': BigInt; '939': BigInt; '940': BigInt; '941': BigInt; '942': BigInt; '943': BigInt; '944': BigInt; '945': BigInt; '946': BigInt; '947': BigInt; '948': BigInt; '949': BigInt; '950': BigInt; '951': BigInt; '952': BigInt; '953': BigInt; '954': BigInt; '955': BigInt; '956': BigInt; '957': BigInt; '958': BigInt; '959': BigInt; '960': BigInt; '961': BigInt; '962': BigInt; '963': BigInt; '964': BigInt; '965': BigInt; '966': BigInt; '967': BigInt; '968': BigInt; '969': BigInt; '970': BigInt; '971': BigInt; '972': BigInt; '973': BigInt; '974': BigInt; '975': BigInt; '976': BigInt; '977': BigInt; '978': BigInt; '979': BigInt; '980': BigInt; '981': BigInt; '982': BigInt; '983': BigInt; '984': BigInt; '985': BigInt; '986': BigInt; '987': BigInt; '988': BigInt; '989': BigInt; '990': BigInt; '991': BigInt; '992': BigInt; '993': BigInt; '994': BigInt; '995': BigInt; '996': BigInt; '997': BigInt; '998': BigInt; '999': BigInt;

    /**
     * gcd(a, b)
     *
     * Finds the greatest common denominator of a and b.
     *
     * - bigInt.gcd(42,56) => 14
     */
    gcd(a: NumOrInt, b: NumOrInt): BigInt;

    /**
     * isInstance(x)
     *
     * Returns true if x is a BigInteger, false otherwise.
     *
     * - bigInt.isInstance(bigInt(14)) => true
     * - bigInt.isInstance(14) => false
     */
    isInstance(x: any): boolean;

    /**
     * lcm(a,b)
     *
     * Finds the least common multiple of a and b.
     *
     * bigInt.lcm(21, 6) => 42
     */
    lcm(a: NumOrInt, b: NumOrInt): BigInt;

    /**
     * max(a,b)
     *
     * Returns the largest of a and b.
     *
     * - bigInt.max(77, 432) => 432
     */
    max(a: NumOrInt, b: NumOrInt): BigInt;

    /**
     * min(a,b)
     *
     * Returns the smallest of a and b.
     *
     * - bigInt.min(77, 432) => 77
     *
     * @param a
     * @param b
     */
    min(a: NumOrInt, b: NumOrInt): BigInt;

    /**
     * randBetween(min, max)
     *
     * Returns a random number between min and max.
     *
     * - bigInt.randBetween("-1e100", "1e100")=> (for example)
     *     8494907165436643479673097939554427056789510374838494147955756275846226209006506706784609314471378745
     *
     * @param min
     * @param max
     */
    randBetween(min: NumOrInt, max: NumOrInt): BigInt;
  }
}

declare const bigInt: bigInt.StaticBigInt;

declare module 'big-integer' {
    export = bigInt;
}
