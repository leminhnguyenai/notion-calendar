package toggleswitch

type Option struct {
	Id         string
	Name       string
	Attributes []string
}

type ToggleSwitch struct {
	Options    []Option
	SwitchName string
	BgColor    string
	Multiply   func(a int, b int) int
}

func NewToggleSwitch(switchName string) ToggleSwitch {
	return ToggleSwitch{
		Options:    []Option{},
		SwitchName: switchName,
		Multiply: func(a int, b int) int {
			return a * b
		},
	}
}

func (ts *ToggleSwitch) AddOption(o Option) {
	ts.Options = append(ts.Options, o)
}
