package encryption

import "golang.org/x/crypto/bcrypt"

func GenerateHash(str string) (string, error) {
	password := []byte(str)
	if len(password) > 72 {
		password = password[:72]
	}

	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	if err = bcrypt.CompareHashAndPassword(hash, password); err != nil {
		return "", err
	}

	return string(hash), nil
}
